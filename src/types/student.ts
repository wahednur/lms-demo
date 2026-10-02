import type {
  Bilingual,
  ISODateString,
  SemesterNumber,
  SessionLabel,
  Shift,
} from "./common";

export type StudentStatus = "active" | "promoted" | "alumni" | "dropped";

export type Gender = "male" | "female" | "other";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | "unknown";

export interface GuardianInfo {
  fatherName: Bilingual;
  motherName: Bilingual;
  guardianPhone: string;
  guardianOccupation?: Bilingual;
  presentAddress: Bilingual;
  permanentAddress: Bilingual;
}

export interface StipendRecord {
  session: SessionLabel;
  eligible: boolean;
  disbursed: boolean;
  amountBdt: number | null;
  remarks?: string;
}

export interface Student {
  id: string;
  roll: string; // class roll, unique within dept+semester+shift+session
  registrationNo: string; // BTEB-style registration number, unique institute-wide
  name: Bilingual;
  photoInitials: string; // placeholder avatar initials, e.g. "RA"
  gender: Gender;
  dateOfBirth: ISODateString;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  departmentId: string;
  semester: SemesterNumber;
  session: SessionLabel;
  shift: Shift;
  status: StudentStatus;
  admissionDate: ISODateString;
  guardian: GuardianInfo;
  stipend: StipendRecord[];
  /** Populated when status transitions to "alumni". */
  alumni?: {
    passedYear: number;
    finalCgpa: number | null;
  };
  /** History of semester promotions, newest first. */
  promotionHistory: {
    fromSemester: SemesterNumber;
    toSemester: SemesterNumber;
    session: SessionLabel;
    date: ISODateString;
    promotedBy: string; // user id
  }[];
}
