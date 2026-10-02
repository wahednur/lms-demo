import type { Role, Student, SystemUser } from "@/types";
import { PERMISSION_MATRIX } from "./matrix";

/**
 * Concrete UI capability checks, derived from the permission matrix plus
 * the narrative role duties on PDF pages 4–5 (e.g. the Principal's BTEB
 * result publication authority is a named duty, not just a matrix cell).
 *
 * These are frontend simulations only — see PROGRESS.md and the README's
 * "Backend integration checklist": production authorization MUST be
 * enforced server-side. Nothing here is a security boundary.
 */

const level = (fn: keyof typeof PERMISSION_MATRIX, role: Role) => PERMISSION_MATRIX[fn][role];

export const canManageUsers = (role: Role) => level("system-setup", role) === "full-access";
export const canManageSystemSettings = (role: Role) => level("system-setup", role) === "full-access";

export const canApproveCalendar = (role: Role) => level("academic-calendar", role) === "approve";
export const canEditCalendar = (role: Role) =>
  ["approve", "create-monitor"].includes(level("academic-calendar", role));
export const canViewCalendar = () => true; // everyone has at least view-only

export const canApproveRoutine = (role: Role) =>
  level("course-routine-distribution", role) === "approve";
export const canEditRoutine = (role: Role) =>
  ["approve", "create-edit"].includes(level("course-routine-distribution", role));

export const canEnterMarks = (role: Role) => level("sessional-exam-marks", role) === "entry-edit";
export const canVerifyMarks = (role: Role) =>
  level("sessional-exam-marks", role) === "verify-approve";
export const canMonitorMarks = (role: Role) =>
  level("sessional-exam-marks", role) === "monitor-verify";
/** BTEB semester result & final tabulation sheet publication — named
 * Principal duty (proposal page 4), distinct from generic "view all". */
export const canPublishResults = (role: Role) => role === "principal";

export const canEnterAttendance = (role: Role) => level("attendance-input", role) === "class-entry";
export const canViewAllAttendance = (role: Role) =>
  ["view-all", "monitor-all-dept"].includes(level("attendance-input", role));
export const canViewDeptAttendance = (role: Role) => level("attendance-input", role) === "dept-view";

export const canGenerateInstituteReports = (role: Role) =>
  level("academic-reports", role) === "full-access";
export const canGenerateDeptReports = (role: Role) =>
  ["full-access", "generate-review", "department-report"].includes(level("academic-reports", role));

export const canFinalApproveApplication = (role: Role) =>
  level("applications", role) === "final-approve";
export const canVerifyApplication = (role: Role) => level("applications", role) === "verify";
export const canRecommendApplication = (role: Role) => level("applications", role) === "recommend";

export const canAccessAdmin = (role: Role) =>
  role === "principal" || role === "academic_incharge" || role === "hod";

export const canAccessTeacherPortal = (role: Role) => role === "teacher" || canAccessAdmin(role);
export const canAccessStudentPortal = (role: Role) => role === "student";

/**
 * Record-level scoping — the matrix says *what function* a role can touch;
 * this governs *which records*. A HOD only ever sees their own department's
 * students even though the matrix grants "Department view" broadly.
 */
export function canViewStudentRecord(user: SystemUser, student: Student): boolean {
  if (user.role === "principal" || user.role === "academic_incharge") return true;
  if (user.role === "hod") return user.departmentId === student.departmentId;
  if (user.role === "student") return user.linkedStudentId === student.id;
  // teacher: can view students only in classes they are assigned to —
  // checked against course assignments at the call site (needs academic service),
  // so this default is conservative (false) and callers narrow further.
  return false;
}

export function canEditStudentRecord(role: Role): boolean {
  return role === "principal" || role === "academic_incharge" || role === "hod";
}
