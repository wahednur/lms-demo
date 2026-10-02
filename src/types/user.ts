import type { Bilingual } from "./common";

export type Role = "principal" | "academic_incharge" | "hod" | "teacher" | "student";

export const ROLES: Role[] = ["principal", "academic_incharge", "hod", "teacher", "student"];

/** A demo system-account. For teacher/hod/principal/academic_incharge roles,
 * `linkedStaffId` points at the Staff record; for student role,
 * `linkedStudentId` points at the Student record. This is how the mock
 * session resolves "my profile / my classes / my children records". */
export interface SystemUser {
  id: string;
  name: Bilingual;
  role: Role;
  email: string;
  active: boolean;
  linkedStaffId?: string;
  linkedStudentId?: string;
  departmentId?: string | null; // for HOD/teacher scoping
  lastLoginAt: string | null;
}

/** The simulated session object persisted client-side. Never contains a
 * real credential — see services/mock/session-service.ts. */
export interface DemoSession {
  userId: string;
  role: Role;
  startedAt: string;
}
