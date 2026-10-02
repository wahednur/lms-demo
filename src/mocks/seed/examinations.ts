import type {
  Examination,
  MarkEntry,
  MarkWorkflowHistoryEntry,
  SemesterNumber,
  Shift,
  Student,
  Subject,
} from "@/types";
import { mulberry32, SEED } from "./rng";
import { STUDENTS } from "./students";
import { SUBJECTS } from "./subjects";
import { priorSession } from "./sessions";
import { DEPARTMENTS } from "./departments";
import { COURSE_ASSIGNMENTS } from "./course-assignments";

const rng = mulberry32(SEED + 55);

const EXAMINATIONS: Examination[] = [];
const examIndex = new Map<string, string>(); // `${deptId}|${semester}|${session}` -> examId
let examCounter = 0;

function examWindow(session: string, semester: SemesterNumber): { startDate: string; endDate: string } {
  const startYear = Number(session.split("-")[0]);
  const isFirstOfPair = semester % 2 === 1;
  const year = isFirstOfPair ? startYear : startYear + 1;
  const month = isFirstOfPair ? "12" : "06";
  return { startDate: `${year}-${month}-05`, endDate: `${year}-${month}-15` };
}

function getOrCreateExam(
  departmentId: string,
  semester: SemesterNumber,
  shift: Shift,
  session: string,
  subjectIds: string[],
): Examination {
  const key = `${departmentId}|${semester}|${shift}|${session}`;
  const existingId = examIndex.get(key);
  if (existingId) return EXAMINATIONS.find((e) => e.id === existingId)!;

  examCounter++;
  const id = `exam-${examCounter}`;
  const { startDate, endDate } = examWindow(session, semester);
  const exam: Examination = {
    id,
    name: {
      en: `Semester ${semester} Final Examination (${session})`,
      bn: `সেমিস্টার ${semester} চূড়ান্ত পরীক্ষা (${session})`,
    },
    type: "semester-final",
    session,
    semester,
    departmentId,
    shift,
    subjectIds,
    startDate,
    endDate,
  };
  EXAMINATIONS.push(exam);
  examIndex.set(key, id);
  return exam;
}

function historyFor(
  status: MarkEntry["status"] | "returned",
  examEndDate: string,
  actorByStage: { teacher: string; hod: string; principal: string },
  returnReason?: string,
): MarkWorkflowHistoryEntry[] {
  const day = (offset: number) => {
    const d = new Date(examEndDate);
    d.setDate(d.getDate() + offset);
    return `${d.toISOString().slice(0, 10)}T10:00:00.000Z`;
  };
  const entries: MarkWorkflowHistoryEntry[] = [
    { status: "draft", at: day(3), byUserId: actorByStage.teacher },
  ];
  if (status === "draft") return entries;
  entries.push({ status: "submitted", at: day(5), byUserId: actorByStage.teacher });
  if (status === "submitted") return entries;
  if (status === "returned") {
    entries.push({
      status: "returned",
      at: day(6),
      byUserId: actorByStage.hod,
      note: returnReason ?? "Please recheck the practical marks against the lab register.",
    });
    return entries;
  }
  entries.push({ status: "verified", at: day(8), byUserId: actorByStage.hod });
  if (status === "verified") return entries;
  entries.push({ status: "published", at: day(12), byUserId: actorByStage.principal });
  return entries;
}

function marksForPercent(subject: Subject, percent: number) {
  const clampPct = Math.max(0, Math.min(100, percent));
  const scale = (max: number) => (max > 0 ? Math.round((max * clampPct) / 100) : 0);
  return {
    tc: subject.maxMarks.tc > 0 ? scale(subject.maxMarks.tc) : null,
    pc: subject.maxMarks.pc > 0 ? scale(subject.maxMarks.pc) : null,
    tf: subject.maxMarks.tf > 0 ? scale(subject.maxMarks.tf) : null,
    pf: subject.maxMarks.pf > 0 ? scale(subject.maxMarks.pf) : null,
  };
}

function randomPercent(): number {
  // Mostly comfortable passes, occasionally weak/failing — gives the
  // grade-distribution charts and "has fail" paths real data to show.
  return rng() < 0.82 ? 55 + rng() * 40 : 25 + rng() * 30;
}

const MARK_ENTRIES: MarkEntry[] = [];
let markCounter = 0;

function pushMark(
  student: Student,
  subject: Subject,
  exam: Examination,
  teacherId: string,
  hodId: string,
  status: MarkEntry["status"] | "returned",
  percentOverride?: number,
  returnReason?: string,
) {
  const percent = percentOverride ?? randomPercent();
  const values = marksForPercent(subject, percent);
  // "Returned for correction" is a transient workflow event, not a stored
  // status — it kicks the entry back to an editable draft while the
  // history log keeps the HOD's reason visible.
  const persistedStatus: MarkEntry["status"] = status === "returned" ? "draft" : status;
  markCounter++;
  MARK_ENTRIES.push({
    id: `mk-${markCounter}`,
    examId: exam.id,
    subjectId: subject.id,
    studentId: student.id,
    departmentId: student.departmentId,
    semester: subject.semester,
    session: exam.session,
    shift: student.shift,
    ...values,
    status: persistedStatus,
    enteredByUserId: `usr-${teacherId.replace("stf-", "")}`,
    history: historyFor(
      status,
      exam.endDate,
      {
        teacher: `usr-${teacherId.replace("stf-", "")}`,
        hod: `usr-${hodId.replace("stf-", "")}`,
        principal: "usr-0001",
      },
      returnReason,
    ),
  });
}

// ---------------------------------------------------------------------------
// 1. Historical, fully published results for every completed semester of
//    every active student, and the full 8-semester history of every alumni
//    student — gives result history, CGPA, and institute-wide report charts
//    real, consistent backing data.
// ---------------------------------------------------------------------------
function teacherFor(departmentId: string, shift: Shift, semester: SemesterNumber): string {
  const assignment = COURSE_ASSIGNMENTS.find(
    (a) => a.departmentId === departmentId && a.shift === shift && a.semester === semester,
  );
  return assignment?.teacherId ?? DEPARTMENTS.find((d) => d.id === departmentId)!.headOfDepartment[shift]!;
}

function hodFor(departmentId: string, shift: Shift): string {
  return DEPARTMENTS.find((d) => d.id === departmentId)!.headOfDepartment[shift]!;
}

for (const student of STUDENTS) {
  const upTo = student.status === "alumni" ? student.semester : student.semester - 1;
  for (let sem = 1; sem <= upTo; sem++) {
    const semester = sem as SemesterNumber;
    const subjects = SUBJECTS.filter((s) => s.departmentId === student.departmentId && s.semester === semester);
    if (subjects.length === 0) continue;
    const session = priorSession(student.session, student.semester, semester);
    const exam = getOrCreateExam(student.departmentId, semester, student.shift, session, subjects.map((s) => s.id));
    const teacherId = teacherFor(student.departmentId, student.shift, semester);
    const hodId = hodFor(student.departmentId, student.shift);
    for (const subject of subjects) {
      pushMark(student, subject, exam, teacherId, hodId, "published");
    }
  }
}

// ---------------------------------------------------------------------------
// 2. In-progress current-semester workflow — concentrated on a handful of
//    "live demo" cells so the verification/publish queues have real,
//    varied-status work without generating thousands of extra rows.
// ---------------------------------------------------------------------------
const HERO = { departmentId: "dept-cst", shift: "1st" as Shift, semester: 5 as SemesterNumber };
const heroStudents = STUDENTS.filter(
  (s) => s.departmentId === HERO.departmentId && s.shift === HERO.shift && s.semester === HERO.semester && s.status === "active",
);
const heroSubjects = SUBJECTS.filter((s) => s.departmentId === HERO.departmentId && s.semester === HERO.semester);
// Order from subjects.ts for dept-cst/sem5: [Web Application Development, Computer Networking II, Operating System]
const [webAppDev, networking2, operatingSystem] = heroSubjects;
const heroSession = heroStudents[0]?.session ?? "2023-2024";
const heroExam = getOrCreateExam(
  HERO.departmentId,
  HERO.semester,
  HERO.shift,
  heroSession,
  heroSubjects.map((s) => s.id),
);
const heroTeacher = teacherFor(HERO.departmentId, HERO.shift, HERO.semester);
const heroHod = hodFor(HERO.departmentId, HERO.shift);

for (const student of heroStudents) {
  // Already verified by the HOD, awaiting the Principal's publish action —
  // this is what the live demo's "switch to Principal → publish" step acts on.
  pushMark(student, networking2, heroExam, heroTeacher, heroHod, "verified");
  pushMark(student, operatingSystem, heroExam, heroTeacher, heroHod, "verified");
  // webAppDev is intentionally left with NO mark entries at all for the
  // whole roster — the live demo's "teacher enters & submits marks" step
  // starts from a genuinely blank class list.
}

// One already-returned example elsewhere, so the "return for correction"
// path has a pre-existing case to inspect without needing to be re-triggered live.
const civilCell = { departmentId: "dept-civil", shift: "1st" as Shift, semester: 5 as SemesterNumber };
const civilStudents = STUDENTS.filter(
  (s) => s.departmentId === civilCell.departmentId && s.shift === civilCell.shift && s.semester === civilCell.semester && s.status === "active",
);
const civilSubjects = SUBJECTS.filter((s) => s.departmentId === civilCell.departmentId && s.semester === civilCell.semester);
if (civilSubjects.length > 0 && civilStudents.length > 0) {
  const civilSession = civilStudents[0].session;
  const civilExam = getOrCreateExam(civilCell.departmentId, civilCell.semester, civilCell.shift, civilSession, civilSubjects.map((s) => s.id));
  const civilTeacher = teacherFor(civilCell.departmentId, civilCell.shift, civilCell.semester);
  const civilHod = hodFor(civilCell.departmentId, civilCell.shift);
  civilStudents.forEach((student, idx) => {
    const subject = civilSubjects[idx % civilSubjects.length];
    const status = idx === 0 ? "returned" : "submitted";
    pushMark(
      student,
      subject,
      civilExam,
      civilTeacher,
      civilHod,
      status,
      undefined,
      "Theory final marks appear transposed with the practical column — please re-check and resubmit.",
    );
  });
}

export { EXAMINATIONS, MARK_ENTRIES };
export const HERO_CELL = HERO;
export const HERO_SUBJECTS = { webAppDev, networking2, operatingSystem };
export const HERO_EXAM_ID = heroExam.id;
