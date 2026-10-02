import type { Bilingual, ISODateString, Shift } from "./common";

export type Designation =
  | "chief-instructor"
  | "instructor"
  | "junior-instructor"
  | "workshop-super"
  | "principal"
  | "vice-principal"
  | "registrar"
  | "office-staff";

export type StaffRole = "principal" | "academic_incharge" | "hod" | "teacher" | "staff";

export interface TrainingRecord {
  id: string;
  title: Bilingual;
  institution: Bilingual;
  year: number;
  durationWeeks: number;
}

export interface Staff {
  id: string;
  name: Bilingual;
  photoInitials: string;
  designation: Designation;
  departmentId: string | null; // null for central admin staff
  shift: Shift | "both" | null;
  isDepartmentHead: boolean;
  staffRole: StaffRole;
  phone: string;
  email: string;
  joiningDate: ISODateString;
  status: "active" | "inactive";
  trainings: TrainingRecord[];
  nidLast4: string; // fictional, partial, non-sensitive placeholder
}
