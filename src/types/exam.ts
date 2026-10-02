import type { SemesterNumber, SessionLabel, Shift } from "./common";
import type { Bilingual } from "./common";

export type ExamType = "class-test" | "midterm" | "sessional" | "semester-final";

export interface Examination {
  id: string;
  name: Bilingual;
  type: ExamType;
  session: SessionLabel;
  semester: SemesterNumber;
  departmentId: string;
  shift: Shift;
  subjectIds: string[];
  startDate: string;
  endDate: string;
}

export type MarkWorkflowStatus = "draft" | "submitted" | "verified" | "published";

export interface MarkWorkflowHistoryEntry {
  status: MarkWorkflowStatus | "returned";
  at: string; // ISO timestamp
  byUserId: string;
  note?: string; // required for "returned"
}

/** One student's marks for one subject within one examination. */
export interface MarkEntry {
  id: string;
  examId: string;
  subjectId: string;
  studentId: string;
  departmentId: string;
  semester: SemesterNumber;
  session: SessionLabel;
  shift: Shift;
  tc: number | null; // Theory Continuous
  pc: number | null; // Practical Continuous
  tf: number | null; // Theory Final
  pf: number | null; // Practical Final
  status: MarkWorkflowStatus;
  enteredByUserId: string | null;
  history: MarkWorkflowHistoryEntry[];
}

export type LetterGrade = "A+" | "A" | "A-" | "B" | "C" | "D" | "F";

export interface SubjectResult {
  subjectId: string;
  totalMarks: number;
  grade: LetterGrade;
  gradePoint: number;
}

/** Published, aggregated result for one student in one semester. Computed
 * (not stored independently) from published MarkEntry rows — see
 * lib/grading.ts and services/mock/exam-service for how this is derived. */
export interface SemesterResult {
  studentId: string;
  semester: SemesterNumber;
  session: SessionLabel;
  subjects: SubjectResult[];
  gpa: number;
  cgpa: number | null;
  hasFail: boolean;
  publishedAt: string | null;
}
