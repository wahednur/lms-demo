import type { SemesterNumber, Shift } from "@/types";

export interface DepartmentSummary {
  departmentId: string;
  studentCount: number;
  activeStudentCount: number;
  teacherCount: number;
  attendancePercent: number | null;
  publishedResultCount: number;
}

export interface InstituteSummary {
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
  attendanceTodayPercent: number | null;
  pendingMarkVerifications: number;
  pendingPublications: number;
  activeUsers: number;
}

export interface ReportFilterParams {
  departmentId?: string;
  semester?: SemesterNumber;
  shift?: Shift;
  session?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Aggregation/reporting layer. Every number here is derived from the same
 * records other services already return (attendance, marks, students) —
 * never a separately-hardcoded total — so dashboard figures and exported
 * reports always agree (brief §11/§8-H).
 */
export interface ReportService {
  instituteSummary(): Promise<InstituteSummary>;
  departmentSummary(departmentId: string): Promise<DepartmentSummary>;
  allDepartmentSummaries(): Promise<DepartmentSummary[]>;
  attendanceTrend(params: ReportFilterParams): Promise<{ date: string; percent: number }[]>;
  enrollmentByDepartment(): Promise<{ departmentId: string; count: number }[]>;
  resultDistribution(params: ReportFilterParams): Promise<{ grade: string; count: number }[]>;
}
