import type { Bilingual, SemesterNumber, SessionLabel, Shift } from "./common";

export type SubjectType = "theory" | "practical" | "both";

/** Subject/course — codes are clearly fictional per brief §8(D), since
 * official BTEB codes were not supplied in the source proposal. */
export interface Subject {
  id: string;
  code: string; // e.g. "CST-2201" — fictional, demo-only
  name: Bilingual;
  departmentId: string;
  semester: SemesterNumber;
  type: SubjectType;
  credit: number;
  maxMarks: {
    tc: number; // Theory Continuous
    pc: number; // Practical Continuous
    tf: number; // Theory Final
    pf: number; // Practical Final
  };
}

/** Teacher ↔ subject assignment for a given session/shift — the source of
 * truth for "assigned classes" everywhere in the teacher portal. */
export interface CourseAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  departmentId: string;
  semester: SemesterNumber;
  shift: Shift;
  session: SessionLabel;
}

export interface AcademicSession {
  label: SessionLabel;
  startYear: number;
  isActive: boolean;
}

export type CalendarEventType =
  | "class-start"
  | "exam"
  | "holiday"
  | "result"
  | "admission"
  | "other";

export interface CalendarEvent {
  id: string;
  title: Bilingual;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  departmentId: string | null; // null = institute-wide
  description?: Bilingual;
}
