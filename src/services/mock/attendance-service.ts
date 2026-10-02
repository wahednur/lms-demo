import type { AttendanceService, AttendanceSaveInput, RosterParams } from "@/services/contracts";
import type { AttendanceRecord, Student } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { STUDENTS, ATTENDANCE_RECORDS, ROUTINE_SLOTS } from "@/mocks/seed";
import { delay, newId } from "@/lib/async";
import { weekdayOf } from "@/lib/weekday";
import { auditService } from "./audit-service";

function readStudents(): Student[] {
  return storage.read(STORAGE_KEYS.students, STUDENTS);
}
function readRecords(): AttendanceRecord[] {
  return storage.read(STORAGE_KEYS.attendance, ATTENDANCE_RECORDS);
}
function writeRecords(records: AttendanceRecord[]) {
  storage.write(STORAGE_KEYS.attendance, records);
}

function eachDate(fromIso: string, toIso: string): string[] {
  const [fy, fm, fd] = fromIso.split("-").map(Number);
  const [ty, tm, td] = toIso.split("-").map(Number);
  const cursor = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  const out: string[] = [];
  while (cursor <= end) {
    out.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export const attendanceService: AttendanceService = {
  async getRoster(params: RosterParams) {
    await delay(200);
    return readStudents()
      .filter(
        (s) =>
          s.departmentId === params.departmentId &&
          s.semester === params.semester &&
          s.shift === params.shift &&
          s.session === params.session &&
          s.status === "active",
      )
      .sort((a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true }));
  },

  async getRecord(params) {
    await delay(180);
    return readRecords().find((r) => r.subjectId === params.subjectId && r.date === params.date) ?? null;
  },

  async saveRecord(input: AttendanceSaveInput, actorUserId) {
    await delay(320);
    const records = readRecords();
    const existing = records.find((r) => r.subjectId === input.subjectId && r.date === input.date);
    const now = new Date().toISOString();
    const record: AttendanceRecord = existing
      ? { ...existing, entries: input.entries, updatedAt: now }
      : {
          id: newId("att"),
          date: input.date,
          subjectId: input.subjectId,
          departmentId: input.departmentId,
          semester: input.semester,
          shift: input.shift,
          session: input.session,
          teacherId: input.teacherId,
          entries: input.entries,
          savedAt: now,
          updatedAt: now,
        };
    writeRecords(existing ? records.map((r) => (r.id === record.id ? record : r)) : [record, ...records]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "teacher",
      action: "attendance-save",
      entityType: "attendanceRecord",
      entityId: record.id,
      summary: `${existing ? "Updated" : "Saved"} attendance for ${input.date} (${input.entries.length} students).`,
    });
    return record;
  },

  async listRecords(params) {
    await delay(220);
    let items = readRecords();
    if (params.departmentId) items = items.filter((r) => r.departmentId === params.departmentId);
    if (params.semester) items = items.filter((r) => r.semester === params.semester);
    if (params.shift) items = items.filter((r) => r.shift === params.shift);
    if (params.subjectId) items = items.filter((r) => r.subjectId === params.subjectId);
    if (params.teacherId) items = items.filter((r) => r.teacherId === params.teacherId);
    if (params.dateFrom) items = items.filter((r) => r.date >= params.dateFrom!);
    if (params.dateTo) items = items.filter((r) => r.date <= params.dateTo!);
    return [...items].sort((a, b) => b.date.localeCompare(a.date));
  },

  async getStudentSummary(studentId, session) {
    await delay(220);
    const records = readRecords().filter((r) => r.entries.some((e) => e.studentId === studentId));
    const scoped = session ? records.filter((r) => r.session === session) : records;
    let present = 0;
    let total = 0;
    const bySubjectMap = new Map<string, { total: number; present: number }>();
    for (const r of scoped) {
      const entry = r.entries.find((e) => e.studentId === studentId);
      if (!entry) continue;
      total++;
      if (entry.status === "present") present++;
      const bucket = bySubjectMap.get(r.subjectId) ?? { total: 0, present: 0 };
      bucket.total++;
      if (entry.status === "present") bucket.present++;
      bySubjectMap.set(r.subjectId, bucket);
    }
    return {
      totalClasses: total,
      present,
      absent: total - present,
      percent: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
      bySubject: Array.from(bySubjectMap.entries()).map(([subjectId, v]) => ({
        subjectId,
        total: v.total,
        present: v.present,
        percent: v.total > 0 ? Math.round((v.present / v.total) * 1000) / 10 : 0,
      })),
    };
  },

  async getMissingEntries(params) {
    await delay(220);
    const records = readRecords();
    const recordedKey = new Set(records.map((r) => `${r.subjectId}|${r.date}`));
    const today = new Date().toISOString().slice(0, 10);
    const dates = eachDate(params.fromDate, params.toDate).filter((d) => d <= today);

    let slots = ROUTINE_SLOTS;
    if (params.departmentId) slots = slots.filter((s) => s.departmentId === params.departmentId);
    if (params.teacherId) slots = slots.filter((s) => s.teacherId === params.teacherId);

    const missing: { date: string; subjectId: string; departmentId: string; semester: AttendanceRecord["semester"]; shift: AttendanceRecord["shift"] }[] = [];
    for (const date of dates) {
      const weekday = weekdayOf(date);
      for (const slot of slots.filter((s) => s.day === weekday)) {
        const key = `${slot.subjectId}|${date}`;
        if (!recordedKey.has(key)) {
          missing.push({
            date,
            subjectId: slot.subjectId,
            departmentId: slot.departmentId,
            semester: slot.semester,
            shift: slot.shift,
          });
        }
      }
    }
    return missing;
  },
};
