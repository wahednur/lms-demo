import type { ExamService, ExamListParams, MarkListParams, MarkDraftInput } from "@/services/contracts";
import type { Examination, MarkEntry, MarkWorkflowHistoryEntry, SemesterNumber } from "@/types";
import { ServiceError } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { EXAMINATIONS, MARK_ENTRIES, SUBJECT_BY_ID } from "@/mocks/seed";
import { computeSubjectResult, computeGpa, computeCgpa } from "@/lib/grading";
import { delay, newId } from "@/lib/async";
import { auditService } from "./audit-service";

function readExams(): Examination[] {
  return storage.read(STORAGE_KEYS.examinations, EXAMINATIONS);
}
function writeExams(exams: Examination[]) {
  storage.write(STORAGE_KEYS.examinations, exams);
}
function readMarks(): MarkEntry[] {
  return storage.read(STORAGE_KEYS.marks, MARK_ENTRIES);
}
function writeMarks(marks: MarkEntry[]) {
  storage.write(STORAGE_KEYS.marks, marks);
}

function pushHistory(entry: MarkEntry, status: MarkWorkflowHistoryEntry["status"], byUserId: string, note?: string): MarkEntry {
  const historyEntry: MarkWorkflowHistoryEntry = { status, at: new Date().toISOString(), byUserId, note };
  return { ...entry, history: [...entry.history, historyEntry] };
}

export const examService: ExamService = {
  async listExaminations(params: ExamListParams = {}) {
    await delay(180);
    let items = readExams();
    if (params.departmentId) items = items.filter((e) => e.departmentId === params.departmentId);
    if (params.semester) items = items.filter((e) => e.semester === params.semester);
    if (params.session) items = items.filter((e) => e.session === params.session);
    if (params.type) items = items.filter((e) => e.type === params.type);
    return items;
  },

  async getExamination(id) {
    await delay(120);
    return readExams().find((e) => e.id === id) ?? null;
  },

  async createExamination(input, actorUserId) {
    await delay(280);
    const exam: Examination = { ...input, id: newId("exam") };
    writeExams([exam, ...readExams()]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "academic_incharge",
      action: "create",
      entityType: "examination",
      entityId: exam.id,
      summary: `Created examination "${exam.name.en}".`,
    });
    return exam;
  },

  async listMarks(params: MarkListParams = {}) {
    await delay(200);
    let items = readMarks();
    if (params.examId) items = items.filter((m) => m.examId === params.examId);
    if (params.subjectId) items = items.filter((m) => m.subjectId === params.subjectId);
    if (params.studentId) items = items.filter((m) => m.studentId === params.studentId);
    if (params.departmentId) items = items.filter((m) => m.departmentId === params.departmentId);
    if (params.semester) items = items.filter((m) => m.semester === params.semester);
    if (params.status) items = items.filter((m) => m.status === params.status);
    // Note: MarkEntry doesn't store a teacherId directly — teacher-scoped
    // views filter by subjectId from the teacher's own course assignments
    // (services/mock/academic-service) before calling this, not here.
    return items;
  },

  async saveDraftMarks(entries: MarkDraftInput[], actorUserId) {
    await delay(300);
    const all = readMarks();
    const updated: MarkEntry[] = [];
    let next = [...all];

    for (const input of entries) {
      const existing = next.find(
        (m) => m.examId === input.examId && m.subjectId === input.subjectId && m.studentId === input.studentId,
      );
      if (existing) {
        if (existing.status !== "draft") {
          throw new ServiceError(
            "VALIDATION",
            `Cannot edit marks once ${existing.status} — only draft entries can be changed directly.`,
          );
        }
        const revised: MarkEntry = pushHistory(
          { ...existing, tc: input.tc, pc: input.pc, tf: input.tf, pf: input.pf },
          "draft",
          actorUserId,
        );
        next = next.map((m) => (m.id === existing.id ? revised : m));
        updated.push(revised);
      } else {
        const fresh: MarkEntry = {
          id: newId("mk"),
          examId: input.examId,
          subjectId: input.subjectId,
          studentId: input.studentId,
          departmentId: "", // filled by caller context via exam below
          semester: 1 as SemesterNumber,
          session: "",
          shift: "1st",
          tc: input.tc,
          pc: input.pc,
          tf: input.tf,
          pf: input.pf,
          status: "draft",
          enteredByUserId: actorUserId,
          history: [{ status: "draft", at: new Date().toISOString(), byUserId: actorUserId }],
        };
        next = [fresh, ...next];
        updated.push(fresh);
      }
    }

    // Backfill department/semester/session/shift from the parent examination
    // and student record context for freshly-created entries.
    const exams = readExams();
    next = next.map((m) => {
      if (m.departmentId !== "") return m;
      const exam = exams.find((e) => e.id === m.examId);
      if (!exam) return m;
      return { ...m, departmentId: exam.departmentId, semester: exam.semester, session: exam.session, shift: exam.shift };
    });

    writeMarks(next);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "teacher",
      action: "marks-draft",
      entityType: "markEntry",
      entityId: entries.length === 1 ? updated[0]?.id ?? "batch" : "batch",
      summary: `Saved draft marks for ${entries.length} student(s).`,
    });
    return next.filter((m) => updated.some((u) => u.id === m.id));
  },

  async submitForVerification(markIds, actorUserId) {
    await delay(280);
    const all = readMarks();
    const affected: MarkEntry[] = [];
    const next = all.map((m) => {
      if (!markIds.includes(m.id)) return m;
      if (m.status !== "draft") {
        throw new ServiceError("VALIDATION", `Entry for subject ${m.subjectId} is already ${m.status}.`);
      }
      const updated = pushHistory({ ...m, status: "submitted" }, "submitted", actorUserId);
      affected.push(updated);
      return updated;
    });
    writeMarks(next);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "teacher",
      action: "marks-submit",
      entityType: "markEntry",
      entityId: "batch",
      summary: `Submitted ${affected.length} mark entries for verification.`,
    });
    return affected;
  },

  async verifyMarks(markIds, actorUserId) {
    await delay(280);
    const all = readMarks();
    const affected: MarkEntry[] = [];
    const next = all.map((m) => {
      if (!markIds.includes(m.id)) return m;
      if (m.status !== "submitted") {
        throw new ServiceError("VALIDATION", `Entry for subject ${m.subjectId} is not awaiting verification.`);
      }
      const updated = pushHistory({ ...m, status: "verified" }, "verified", actorUserId);
      affected.push(updated);
      return updated;
    });
    writeMarks(next);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "marks-verify",
      entityType: "markEntry",
      entityId: "batch",
      summary: `Verified ${affected.length} mark entries.`,
    });
    return affected;
  },

  async returnForCorrection(markIds, reason, actorUserId) {
    await delay(280);
    const all = readMarks();
    const affected: MarkEntry[] = [];
    const next = all.map((m) => {
      if (!markIds.includes(m.id)) return m;
      if (m.status !== "submitted") {
        throw new ServiceError("VALIDATION", `Entry for subject ${m.subjectId} is not awaiting verification.`);
      }
      const returned = pushHistory({ ...m, status: "draft" }, "returned", actorUserId, reason);
      affected.push(returned);
      return returned;
    });
    writeMarks(next);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "marks-return",
      entityType: "markEntry",
      entityId: "batch",
      summary: `Returned ${affected.length} mark entries for correction: ${reason}`,
    });
    return affected;
  },

  async publishResults(examId, actorUserId) {
    await delay(380);
    const exam = readExams().find((e) => e.id === examId);
    if (!exam) throw new ServiceError("NOT_FOUND", `Examination ${examId} not found`);
    const all = readMarks();
    const examMarks = all.filter((m) => m.examId === examId);
    if (examMarks.length === 0) {
      throw new ServiceError("VALIDATION", "No marks have been entered for this examination yet.");
    }
    const roster = Array.from(new Set(examMarks.map((m) => m.studentId)));
    const gaps: string[] = [];
    for (const subjectId of exam.subjectIds) {
      for (const studentId of roster) {
        const mark = examMarks.find((m) => m.subjectId === subjectId && m.studentId === studentId);
        if (!mark || (mark.status !== "verified" && mark.status !== "published")) {
          gaps.push(`${subjectId}:${studentId}`);
        }
      }
    }
    if (gaps.length > 0) {
      throw new ServiceError(
        "VALIDATION",
        `${gaps.length} mark entries are not yet verified — every subject must be verified for every student before publishing.`,
      );
    }

    const affected: MarkEntry[] = [];
    const next = all.map((m) => {
      if (m.examId !== examId || m.status !== "verified") return m;
      const updated = pushHistory({ ...m, status: "published" }, "published", actorUserId);
      affected.push(updated);
      return updated;
    });
    writeMarks(next);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "marks-publish",
      entityType: "examination",
      entityId: examId,
      summary: `Published results for "${exam.name.en}" (${affected.length} entries, ${roster.length} students).`,
    });
    return affected;
  },

  async getSemesterResult(studentId, semester, session) {
    await delay(200);
    const marks = readMarks().filter(
      (m) => m.studentId === studentId && m.semester === semester && m.session === session && m.status === "published",
    );
    if (marks.length === 0) return null;

    const subjects = marks
      .map((m) => {
        const subject = SUBJECT_BY_ID[m.subjectId];
        return subject ? computeSubjectResult(m, subject) : null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const { gpa, hasFail } = computeGpa(subjects);
    const publishedAt = marks
      .map((m) => m.history.find((h) => h.status === "published")?.at)
      .filter((d): d is string => !!d)
      .sort()
      .at(-1) ?? null;

    // CGPA = running average of this and all earlier published semesters.
    const allPublished = readMarks().filter((m) => m.studentId === studentId && m.status === "published");
    const bySemester = new Map<number, MarkEntry[]>();
    for (const m of allPublished) {
      bySemester.set(m.semester, [...(bySemester.get(m.semester) ?? []), m]);
    }
    const priorResults = Array.from(bySemester.entries())
      .filter(([sem]) => sem <= semester)
      .map(([sem, semMarks]) => {
        const semSubjects = semMarks
          .map((m) => {
            const subject = SUBJECT_BY_ID[m.subjectId];
            return subject ? computeSubjectResult(m, subject) : null;
          })
          .filter((s): s is NonNullable<typeof s> => s !== null);
        const semGpa = computeGpa(semSubjects);
        return { studentId, semester: sem as SemesterNumber, session, subjects: semSubjects, gpa: semGpa.gpa, cgpa: null, hasFail: semGpa.hasFail, publishedAt };
      });

    return {
      studentId,
      semester,
      session,
      subjects,
      gpa,
      cgpa: computeCgpa(priorResults),
      hasFail,
      publishedAt,
    };
  },

  async getStudentResultHistory(studentId) {
    await delay(220);
    const marks = readMarks().filter((m) => m.studentId === studentId && m.status === "published");
    const bySemesterSession = new Map<string, MarkEntry[]>();
    for (const m of marks) {
      const key = `${m.semester}|${m.session}`;
      bySemesterSession.set(key, [...(bySemesterSession.get(key) ?? []), m]);
    }
    const sortedKeys = Array.from(bySemesterSession.keys()).sort(
      (a, b) => Number(a.split("|")[0]) - Number(b.split("|")[0]),
    );

    const results = [];
    const running: { gpa: number; publishedAt: string | null }[] = [];
    for (const key of sortedKeys) {
      const semMarks = bySemesterSession.get(key)!;
      const [semStr, session] = key.split("|");
      const semester = Number(semStr) as SemesterNumber;
      const subjects = semMarks
        .map((m) => {
          const subject = SUBJECT_BY_ID[m.subjectId];
          return subject ? computeSubjectResult(m, subject) : null;
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);
      const { gpa, hasFail } = computeGpa(subjects);
      const publishedAt =
        semMarks.map((m) => m.history.find((h) => h.status === "published")?.at).filter((d): d is string => !!d).sort().at(-1) ?? null;
      running.push({ gpa, publishedAt });
      const cgpa = computeCgpa(running.map((r) => ({ studentId, semester, session, subjects: [], gpa: r.gpa, cgpa: null, hasFail: false, publishedAt: r.publishedAt })));
      results.push({ studentId, semester, session, subjects, gpa, cgpa, hasFail, publishedAt });
    }
    return results;
  },
};
