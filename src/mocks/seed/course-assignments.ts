import type { CourseAssignment, Shift } from "@/types";
import { DEPARTMENTS } from "./departments";
import { SUBJECTS } from "./subjects";
import { SEMESTER_TO_SESSION } from "./sessions";

/**
 * Deterministic rule: each department+shift has two teachers — the HOD
 * (headOfDepartment for that shift) handles semesters 6–8, the junior
 * teacher (the "stf-00xx" id one slot after the HOD pair, per staff.ts)
 * handles semesters 1–5. Keeps the dataset simple while still giving every
 * teacher a believable multi-subject course load, AND keeps the "teacher
 * enters marks / HOD verifies" demo path a genuine two-person workflow —
 * the hero cell (dept-cst/1st/semester 5) must land on the junior teacher,
 * not the HOD, or "switch to teacher" and "switch to HOD to verify" would
 * be the same person.
 */
const JUNIOR_TEACHER_BY_DEPT_SHIFT: Record<string, Record<Shift, string>> = {
  "dept-cst": { "1st": "stf-0011", "2nd": "stf-0012" },
  "dept-civil": { "1st": "stf-0013", "2nd": "stf-0014" },
  "dept-electrical": { "1st": "stf-0015", "2nd": "stf-0016" },
  "dept-electronics": { "1st": "stf-0017", "2nd": "stf-0018" },
};

function buildCourseAssignments(): CourseAssignment[] {
  const assignments: CourseAssignment[] = [];
  let counter = 1;
  for (const dept of DEPARTMENTS) {
    for (const shift of dept.shifts) {
      const hodId = dept.headOfDepartment[shift];
      const juniorId = JUNIOR_TEACHER_BY_DEPT_SHIFT[dept.id][shift];
      const deptSubjects = SUBJECTS.filter((s) => s.departmentId === dept.id);
      for (const subject of deptSubjects) {
        const teacherId = subject.semester <= 5 ? juniorId : hodId;
        if (!teacherId) continue;
        assignments.push({
          id: `ca-${counter++}`,
          teacherId,
          subjectId: subject.id,
          departmentId: dept.id,
          semester: subject.semester,
          shift,
          session: SEMESTER_TO_SESSION[subject.semester],
        });
      }
    }
  }
  return assignments;
}

export const COURSE_ASSIGNMENTS: CourseAssignment[] = buildCourseAssignments();
