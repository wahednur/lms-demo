import type { SystemUser } from "@/types";
import { STAFF } from "./staff";
import { STUDENTS } from "./students";
import { DEPARTMENTS } from "./departments";

/** `usr-XXXX` mirrors the staff id suffix 1:1 (stf-0004 → usr-0004) — a
 * fixed convention relied on elsewhere (e.g. promotionHistory.promotedBy,
 * examinations.ts actor ids) so any module can derive a user id from a
 * staff id without a lookup table. */
const STAFF_ROLE_TO_USER_ROLE = {
  principal: "principal",
  academic_incharge: "academic_incharge",
  hod: "hod",
  teacher: "teacher",
} as const;

const staffUsers: SystemUser[] = STAFF.filter((s) => s.staffRole !== "staff").map((s) => ({
  id: `usr-${s.id.replace("stf-", "")}`,
  name: s.name,
  role: STAFF_ROLE_TO_USER_ROLE[s.staffRole as keyof typeof STAFF_ROLE_TO_USER_ROLE],
  email: s.email,
  active: s.status === "active",
  linkedStaffId: s.id,
  departmentId: s.departmentId,
  lastLoginAt: "2026-09-30T08:15:00.000Z",
}));

// One representative student account per department plus the hero cohort's
// first student (the headline demo account), and one alumni account — a
// believable directory without provisioning a login for all ~150 students.
const heroStudent = STUDENTS.find(
  (s) => s.departmentId === "dept-cst" && s.shift === "1st" && s.semester === 5 && s.status === "active",
)!;
const otherDeptShowcase = DEPARTMENTS.filter((d) => d.id !== "dept-cst").map(
  (d) => STUDENTS.find((s) => s.departmentId === d.id && s.status === "active")!,
);
const alumniShowcase = STUDENTS.find((s) => s.status === "alumni")!;

const showcaseStudents = [heroStudent, ...otherDeptShowcase, alumniShowcase].filter(Boolean);

const studentUsers: SystemUser[] = showcaseStudents.map((s) => ({
  id: `usr-std-${s.id.replace("std-", "")}`,
  name: s.name,
  role: "student",
  email: s.email,
  active: s.status !== "dropped",
  linkedStudentId: s.id,
  departmentId: s.departmentId,
  lastLoginAt: s.id === heroStudent.id ? "2026-09-29T19:40:00.000Z" : null,
}));

export const USERS: SystemUser[] = [...staffUsers, ...studentUsers];
export const USER_BY_ID: Record<string, SystemUser> = Object.fromEntries(USERS.map((u) => [u.id, u]));

/** The five headline accounts shown on /login — one per RBAC role from the
 * proposal (PDF page 5), each clearly tied to a specific seeded person so
 * the guided demo sequence has a stable cast. */
export const DEMO_ACCOUNT_IDS = {
  principal: "usr-0001",
  academic_incharge: "usr-0004",
  hod: "usr-0002",
  teacher: "usr-0011",
  student: `usr-std-${heroStudent.id.replace("std-", "")}`,
} as const;
