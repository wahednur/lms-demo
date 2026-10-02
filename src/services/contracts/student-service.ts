import type { Page, PageParams, SemesterNumber, Shift, Student, StudentStatus, StipendRecord } from "@/types";
import type { StudentFormValues } from "@/lib/validation/student";

export interface StudentListParams extends PageParams {
  departmentId?: string;
  semester?: SemesterNumber;
  shift?: Shift;
  session?: string;
  status?: StudentStatus;
}

/**
 * Typed service contract for student management. `services/mock` implements
 * this over the seeded dataset + localStorage; a future `services/api`
 * implementation would satisfy the same interface over HTTP, so feature
 * code never changes when a real backend arrives.
 */
export interface StudentService {
  list(params?: StudentListParams): Promise<Page<Student>>;
  getById(id: string): Promise<Student | null>;
  /** Throws ServiceError("CONFLICT") on duplicate roll (within dept+semester+shift+session)
   * or duplicate registration number (institute-wide). */
  create(input: StudentFormValues, actorUserId: string): Promise<Student>;
  update(id: string, input: Partial<StudentFormValues>, actorUserId: string): Promise<Student>;
  promote(
    id: string,
    toSemester: SemesterNumber,
    session: string,
    actorUserId: string,
  ): Promise<Student>;
  moveToAlumni(
    id: string,
    input: { passedYear: number; finalCgpa: number | null },
    actorUserId: string,
  ): Promise<Student>;
  setStipend(id: string, record: StipendRecord, actorUserId: string): Promise<Student>;
}
