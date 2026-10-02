import {
  STUDENTS,
  STAFF,
  SUBJECTS,
  ROUTINE_SLOTS,
  ATTENDANCE_RECORDS,
  EXAMINATIONS,
  MARK_ENTRIES,
  NOTICES,
  RESOURCES,
  USERS,
  DEMO_ACCOUNT_IDS,
} from "../src/mocks/seed/index";

console.log("students", STUDENTS.length);
console.log("staff", STAFF.length);
console.log("subjects", SUBJECTS.length);
console.log("routine slots", ROUTINE_SLOTS.length);
console.log("attendance records", ATTENDANCE_RECORDS.length);
console.log("examinations", EXAMINATIONS.length);
console.log("mark entries", MARK_ENTRIES.length);
console.log("notices", NOTICES.length);
console.log("resources", RESOURCES.length);
console.log("users", USERS.length);
console.log("demo accounts", DEMO_ACCOUNT_IDS);

const rollKey = (s: (typeof STUDENTS)[number]) =>
  `${s.departmentId}|${s.shift}|${s.semester}|${s.session}|${s.roll}`;
const rollSeen = new Map<string, string>();
let dupRoll = 0;
for (const s of STUDENTS) {
  const k = rollKey(s);
  if (rollSeen.has(k)) {
    dupRoll++;
    console.log("DUP ROLL", k, rollSeen.get(k), s.id);
  }
  rollSeen.set(k, s.id);
}
console.log("duplicate rolls", dupRoll);

const regSeen = new Set<string>();
let dupReg = 0;
for (const s of STUDENTS) {
  if (regSeen.has(s.registrationNo)) {
    dupReg++;
    console.log("DUP REG", s.registrationNo, s.id);
  }
  regSeen.add(s.registrationNo);
}
console.log("duplicate registrations", dupReg);

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function overlap(a: (typeof ROUTINE_SLOTS)[number], b: (typeof ROUTINE_SLOTS)[number]) {
  return a.day === b.day && toMin(a.startTime) < toMin(b.endTime) && toMin(b.startTime) < toMin(a.endTime);
}
let teacherConflicts = 0;
let roomConflicts = 0;
for (let i = 0; i < ROUTINE_SLOTS.length; i++) {
  for (let j = i + 1; j < ROUTINE_SLOTS.length; j++) {
    const a = ROUTINE_SLOTS[i];
    const b = ROUTINE_SLOTS[j];
    if (overlap(a, b)) {
      if (a.teacherId === b.teacherId) {
        teacherConflicts++;
        console.log("TEACHER CONFLICT", a.id, b.id);
      }
      if (a.room === b.room) {
        roomConflicts++;
        console.log("ROOM CONFLICT", a.id, b.id);
      }
    }
  }
}
console.log("teacher conflicts", teacherConflicts, "room conflicts", roomConflicts);

const deptIds = new Set(["dept-cst", "dept-civil", "dept-electrical", "dept-electronics"]);
const badDept = STUDENTS.filter((s) => !deptIds.has(s.departmentId));
console.log("students with bad dept", badDept.length);

const subjectIds = new Set(SUBJECTS.map((s) => s.id));
const badMarkSubjects = MARK_ENTRIES.filter((m) => !subjectIds.has(m.subjectId));
console.log("mark entries with bad subject ref", badMarkSubjects.length);

const studentIds = new Set(STUDENTS.map((s) => s.id));
const badMarkStudents = MARK_ENTRIES.filter((m) => !studentIds.has(m.studentId));
console.log("mark entries with bad student ref", badMarkStudents.length);

const staffIds = new Set(STAFF.map((s) => s.id));
const badRoutineTeachers = ROUTINE_SLOTS.filter((r) => !staffIds.has(r.teacherId));
console.log("routine slots with bad teacher ref", badRoutineTeachers.length);

const alumni = STUDENTS.filter((s) => s.status === "alumni");
console.log("alumni count", alumni.length);

const byDeptShiftSem = new Map<string, number>();
for (const s of STUDENTS) {
  const k = `${s.departmentId}|${s.shift}|${s.semester}`;
  byDeptShiftSem.set(k, (byDeptShiftSem.get(k) ?? 0) + 1);
}
console.log("hero cell size (dept-cst|1st|5)", byDeptShiftSem.get("dept-cst|1st|5"));
