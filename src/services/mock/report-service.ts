import type { ReportService, ReportFilterParams } from "@/services/contracts";
import type { AttendanceRecord, MarkEntry, Staff, Student, SystemUser } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { STUDENTS, STAFF, ATTENDANCE_RECORDS, MARK_ENTRIES, USERS, DEPARTMENTS, SUBJECT_BY_ID } from "@/mocks/seed";
import { computeSubjectResult } from "@/lib/grading";
import { delay } from "@/lib/async";

const readStudents = (): Student[] => storage.read(STORAGE_KEYS.students, STUDENTS);
const readStaff = (): Staff[] => storage.read(STORAGE_KEYS.staff, STAFF);
const readAttendance = (): AttendanceRecord[] => storage.read(STORAGE_KEYS.attendance, ATTENDANCE_RECORDS);
const readMarks = (): MarkEntry[] => storage.read(STORAGE_KEYS.marks, MARK_ENTRIES);
const readUsers = (): SystemUser[] => storage.read(STORAGE_KEYS.users, USERS);

function attendancePercentFor(records: AttendanceRecord[]): number | null {
  let present = 0;
  let total = 0;
  for (const r of records) {
    for (const e of r.entries) {
      total++;
      if (e.status === "present") present++;
    }
  }
  return total > 0 ? Math.round((present / total) * 1000) / 10 : null;
}

function departmentSummaryFor(departmentId: string) {
  const students = readStudents().filter((s) => s.departmentId === departmentId);
  const staff = readStaff().filter((s) => s.departmentId === departmentId);
  const attendance = readAttendance().filter((a) => a.departmentId === departmentId);
  const marks = readMarks().filter((m) => m.departmentId === departmentId && m.status === "published");

  return {
    departmentId,
    studentCount: students.length,
    activeStudentCount: students.filter((s) => s.status === "active").length,
    teacherCount: staff.filter((s) => s.status === "active" && (s.staffRole === "teacher" || s.staffRole === "hod")).length,
    attendancePercent: attendancePercentFor(attendance),
    publishedResultCount: marks.length,
  };
}

export const reportService: ReportService = {
  async instituteSummary() {
    await delay(220);
    const students = readStudents();
    const staff = readStaff();
    const marks = readMarks();
    const users = readUsers();
    const attendance = readAttendance();
    const today = new Date().toISOString().slice(0, 10);

    return {
      totalStudents: students.filter((s) => s.status === "active").length,
      totalTeachers: staff.filter((s) => (s.staffRole === "teacher" || s.staffRole === "hod") && s.status === "active").length,
      totalDepartments: DEPARTMENTS.length,
      attendanceTodayPercent: attendancePercentFor(attendance.filter((a) => a.date === today)),
      pendingMarkVerifications: marks.filter((m) => m.status === "submitted").length,
      pendingPublications: marks.filter((m) => m.status === "verified").length,
      activeUsers: users.filter((u) => u.active).length,
    };
  },

  async departmentSummary(departmentId) {
    await delay(200);
    return departmentSummaryFor(departmentId);
  },

  async allDepartmentSummaries() {
    await delay(250);
    return DEPARTMENTS.map((d) => departmentSummaryFor(d.id));
  },

  async attendanceTrend(params: ReportFilterParams) {
    await delay(220);
    let records = readAttendance();
    if (params.departmentId) records = records.filter((r) => r.departmentId === params.departmentId);
    if (params.semester) records = records.filter((r) => r.semester === params.semester);
    if (params.shift) records = records.filter((r) => r.shift === params.shift);
    if (params.session) records = records.filter((r) => r.session === params.session);
    if (params.dateFrom) records = records.filter((r) => r.date >= params.dateFrom!);
    if (params.dateTo) records = records.filter((r) => r.date <= params.dateTo!);

    const byDate = new Map<string, AttendanceRecord[]>();
    for (const r of records) byDate.set(r.date, [...(byDate.get(r.date) ?? []), r]);
    return Array.from(byDate.entries())
      .map(([date, recs]) => ({ date, percent: attendancePercentFor(recs) ?? 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async enrollmentByDepartment() {
    await delay(180);
    const students = readStudents().filter((s) => s.status === "active");
    return DEPARTMENTS.map((d) => ({
      departmentId: d.id,
      count: students.filter((s) => s.departmentId === d.id).length,
    }));
  },

  async resultDistribution(params: ReportFilterParams) {
    await delay(220);
    let marks = readMarks().filter((m) => m.status === "published");
    if (params.departmentId) marks = marks.filter((m) => m.departmentId === params.departmentId);
    if (params.semester) marks = marks.filter((m) => m.semester === params.semester);
    if (params.session) marks = marks.filter((m) => m.session === params.session);

    const counts = new Map<string, number>();
    for (const m of marks) {
      const subject = SUBJECT_BY_ID[m.subjectId];
      if (!subject) continue;
      const { grade } = computeSubjectResult(m, subject);
      counts.set(grade, (counts.get(grade) ?? 0) + 1);
    }
    const order = ["A+", "A", "A-", "B", "C", "D", "F"];
    return order.filter((g) => counts.has(g)).map((grade) => ({ grade, count: counts.get(grade)! }));
  },
};
