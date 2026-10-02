import type {
  AcademicSession,
  CalendarEvent,
  CourseAssignment,
  Department,
  SemesterNumber,
  Shift,
  Subject,
} from "@/types";

export interface AcademicService {
  listDepartments(): Promise<Department[]>;
  getDepartment(idOrSlug: string): Promise<Department | null>;

  listSubjects(params?: { departmentId?: string; semester?: SemesterNumber }): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | null>;

  listSessions(): Promise<AcademicSession[]>;

  listCourseAssignments(params?: {
    teacherId?: string;
    departmentId?: string;
    semester?: SemesterNumber;
    shift?: Shift;
    session?: string;
  }): Promise<CourseAssignment[]>;

  listCalendarEvents(params?: { departmentId?: string | null }): Promise<CalendarEvent[]>;

  /** Essential setup actions (brief §8/D) — enough to demonstrate the
   * workflow, not a full curriculum designer. */
  createSubject(input: Omit<Subject, "id">, actorUserId: string): Promise<Subject>;
  createCourseAssignment(
    input: Omit<CourseAssignment, "id">,
    actorUserId: string,
  ): Promise<CourseAssignment>;
  removeCourseAssignment(id: string, actorUserId: string): Promise<void>;
}
