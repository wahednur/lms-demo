import type { AttendanceEntry, AttendanceRecord, SemesterNumber, Shift, Weekday } from "@/types";
import { mulberry32, SEED } from "./rng";
import { ROUTINE_SLOTS } from "./routine";
import { STUDENTS } from "./students";
import { SEMESTER_TO_SESSION } from "./sessions";

const rng = mulberry32(SEED + 2024);

const WEEKDAY_OFFSET: Record<Weekday, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/** Sunday anchors for the five fully-recorded weeks preceding the current
 * one. The current week (Sun 2026-09-27 – Thu 2026-10-01, "today" per the
 * demo's fixed timeline) is intentionally left unrecorded so the guided
 * demo has a real, un-saved class to take attendance for. */
const WEEK_STARTS = ["2026-08-23", "2026-08-30", "2026-09-06", "2026-09-13", "2026-09-20"];
const RECENT_WEEK_STARTS = ["2026-09-06", "2026-09-13"]; // lighter history for non-hero cells

function dateFor(weekStartIso: string, weekday: Weekday): string {
  const [y, m, d] = weekStartIso.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  base.setDate(base.getDate() + WEEKDAY_OFFSET[weekday]);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface CellSpec {
  departmentId: string;
  shift: Shift;
  semester: SemesterNumber;
  weeks: string[];
}

const CELLS: CellSpec[] = [
  { departmentId: "dept-cst", shift: "1st", semester: 5, weeks: WEEK_STARTS },
  { departmentId: "dept-civil", shift: "1st", semester: 5, weeks: RECENT_WEEK_STARTS },
  { departmentId: "dept-electrical", shift: "1st", semester: 5, weeks: RECENT_WEEK_STARTS },
  { departmentId: "dept-electronics", shift: "1st", semester: 5, weeks: RECENT_WEEK_STARTS },
  { departmentId: "dept-cst", shift: "2nd", semester: 3, weeks: RECENT_WEEK_STARTS },
];

function buildAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let counter = 0;

  for (const cell of CELLS) {
    const roster = STUDENTS.filter(
      (s) =>
        s.departmentId === cell.departmentId &&
        s.shift === cell.shift &&
        s.semester === cell.semester &&
        s.status === "active",
    );
    if (roster.length === 0) continue;

    const theorySlots = ROUTINE_SLOTS.filter(
      (slot) =>
        slot.departmentId === cell.departmentId &&
        slot.shift === cell.shift &&
        slot.semester === cell.semester &&
        slot.kind === "theory",
    );

    for (const slot of theorySlots) {
      for (const weekStart of cell.weeks) {
        const date = dateFor(weekStart, slot.day);
        const entries: AttendanceEntry[] = roster.map((student) => ({
          studentId: student.id,
          status: rng() < 0.9 ? "present" : "absent",
        }));
        counter++;
        records.push({
          id: `att-${counter}`,
          date,
          subjectId: slot.subjectId,
          departmentId: cell.departmentId,
          semester: cell.semester,
          shift: cell.shift,
          session: SEMESTER_TO_SESSION[cell.semester],
          teacherId: slot.teacherId,
          entries,
          savedAt: `${date}T09:30:00.000Z`,
          updatedAt: `${date}T09:30:00.000Z`,
        });
      }
    }
  }

  return records;
}

export const ATTENDANCE_RECORDS: AttendanceRecord[] = buildAttendance();
