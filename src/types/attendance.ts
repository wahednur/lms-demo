import type { ISODateString, SemesterNumber, SessionLabel, Shift } from "./common";

export type AttendanceMark = "present" | "absent";

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceMark;
}

/**
 * One saved attendance record = one subject, one date, one class roster.
 * Never materialized with default "present" values before a teacher saves —
 * absence of a record for a date means "not yet taken", not "all present".
 */
export interface AttendanceRecord {
  id: string;
  date: ISODateString;
  subjectId: string;
  departmentId: string;
  semester: SemesterNumber;
  shift: Shift;
  session: SessionLabel;
  teacherId: string;
  entries: AttendanceEntry[];
  savedAt: string; // ISO timestamp
  updatedAt: string;
}
