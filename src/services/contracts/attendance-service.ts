import type {
  AttendanceEntry,
  AttendanceRecord,
  SemesterNumber,
  Shift,
  Student,
} from "@/types";

export interface RosterParams {
  departmentId: string;
  semester: SemesterNumber;
  shift: Shift;
  session: string;
}

export interface AttendanceSaveInput {
  date: string;
  subjectId: string;
  departmentId: string;
  semester: SemesterNumber;
  shift: Shift;
  session: string;
  teacherId: string;
  entries: AttendanceEntry[];
}

export interface StudentAttendanceSummary {
  totalClasses: number;
  present: number;
  absent: number;
  percent: number;
  bySubject: { subjectId: string; total: number; present: number; percent: number }[];
}

export interface AttendanceService {
  getRoster(params: RosterParams): Promise<Student[]>;
  /** Returns null if no record exists yet for this subject+date — callers
   * must distinguish this from an all-present record (brief §8/E). */
  getRecord(params: { subjectId: string; date: string }): Promise<AttendanceRecord | null>;
  saveRecord(input: AttendanceSaveInput, actorUserId: string): Promise<AttendanceRecord>;
  listRecords(params: {
    departmentId?: string;
    semester?: SemesterNumber;
    shift?: Shift;
    subjectId?: string;
    teacherId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AttendanceRecord[]>;
  getStudentSummary(studentId: string, session?: string): Promise<StudentAttendanceSummary>;
  /** Roster/subject/date combinations implied by the routine for the given
   * window that have no saved AttendanceRecord yet. */
  getMissingEntries(params: {
    departmentId?: string;
    teacherId?: string;
    fromDate: string;
    toDate: string;
  }): Promise<{ date: string; subjectId: string; departmentId: string; semester: SemesterNumber; shift: Shift }[]>;
}
