import type { Role } from "@/types";

/** Where each role lands immediately after logging in / switching identity. */
export const ROLE_HOME: Record<Role, string> = {
  principal: "/admin",
  academic_incharge: "/admin",
  hod: "/admin",
  teacher: "/portal/teacher",
  student: "/portal/student",
};
