import type {
  Examination,
  ExamType,
  MarkEntry,
  MarkWorkflowStatus,
  SemesterNumber,
  SemesterResult,
  Shift,
} from "@/types";

export interface ExamListParams {
  departmentId?: string;
  semester?: SemesterNumber;
  session?: string;
  type?: ExamType;
}

export interface MarkListParams {
  examId?: string;
  subjectId?: string;
  studentId?: string;
  departmentId?: string;
  semester?: SemesterNumber;
  teacherId?: string;
  status?: MarkWorkflowStatus;
}

export interface MarkDraftInput {
  examId: string;
  subjectId: string;
  studentId: string;
  tc: number | null;
  pc: number | null;
  tf: number | null;
  pf: number | null;
}

/**
 * Enforces Draft → Submitted → Verified → Published. Each transition
 * validates the current status server-side (mock-side, standing in for a
 * real backend) rather than trusting the UI to only call it at the right
 * time — see services/mock/exam-service.ts.
 */
export interface ExamService {
  listExaminations(params?: ExamListParams): Promise<Examination[]>;
  getExamination(id: string): Promise<Examination | null>;
  createExamination(input: Omit<Examination, "id">, actorUserId: string): Promise<Examination>;

  listMarks(params?: MarkListParams): Promise<MarkEntry[]>;
  saveDraftMarks(entries: MarkDraftInput[], actorUserId: string): Promise<MarkEntry[]>;
  submitForVerification(markIds: string[], actorUserId: string): Promise<MarkEntry[]>;
  verifyMarks(markIds: string[], actorUserId: string): Promise<MarkEntry[]>;
  returnForCorrection(markIds: string[], reason: string, actorUserId: string): Promise<MarkEntry[]>;
  /** Principal-only (brief §8/F + PDF role narrative). Publishes every
   * verified mark for the examination and makes results visible to students. */
  publishResults(examId: string, actorUserId: string): Promise<MarkEntry[]>;

  /** Null if not yet published — students must never receive a result object
   * for an unpublished semester. */
  getSemesterResult(studentId: string, semester: SemesterNumber, session: string): Promise<SemesterResult | null>;
  getStudentResultHistory(studentId: string): Promise<SemesterResult[]>;
}

export type { Shift };
