import type { RoutineSlot, SemesterNumber, Shift, Weekday } from "@/types";
import { DEPARTMENTS } from "./departments";
import { SUBJECTS } from "./subjects";
import { COURSE_ASSIGNMENTS } from "./course-assignments";
import { SEMESTER_TO_SESSION } from "./sessions";
import { rangesOverlap } from "@/lib/validation/routine";

/** Class days are Sunday–Thursday (Bangladesh work week; Fri/Sat are the
 * institutional weekend, intentionally excluded from the routine grid). */
const CLASS_DAYS: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday"];

const PERIODS: Record<Shift, { start: string; end: string }[]> = {
  "1st": [
    { start: "08:00", end: "08:50" },
    { start: "08:50", end: "09:40" },
    { start: "09:50", end: "10:40" },
    { start: "10:40", end: "11:30" },
    { start: "11:40", end: "12:30" },
  ],
  "2nd": [
    { start: "13:00", end: "13:50" },
    { start: "13:50", end: "14:40" },
    { start: "14:50", end: "15:40" },
    { start: "15:40", end: "16:30" },
    { start: "16:40", end: "17:30" },
  ],
};

/** (periodIndex pairs) that form one contiguous double-block, used for practical sessions. */
const DOUBLE_BLOCKS: [number, number][] = [
  [0, 1],
  [2, 3],
];

interface Booking {
  day: Weekday;
  start: string;
  end: string;
}

function conflicts(existing: Booking[], day: Weekday, start: string, end: string): boolean {
  return existing.some((b) => b.day === day && rangesOverlap(b.start, b.end, start, end));
}

function buildRoutine(): RoutineSlot[] {
  const slots: RoutineSlot[] = [];
  const teacherBookings = new Map<string, Booking[]>();
  const roomBookings = new Map<string, Booking[]>();
  const classBookings = new Map<string, Booking[]>();

  const bookAll = (teacherId: string, room: string, classKey: string, b: Booking) => {
    teacherBookings.set(teacherId, [...(teacherBookings.get(teacherId) ?? []), b]);
    roomBookings.set(room, [...(roomBookings.get(room) ?? []), b]);
    classBookings.set(classKey, [...(classBookings.get(classKey) ?? []), b]);
  };

  const isFree = (teacherId: string, room: string, classKey: string, b: Booking) =>
    !conflicts(teacherBookings.get(teacherId) ?? [], b.day, b.start, b.end) &&
    !conflicts(roomBookings.get(room) ?? [], b.day, b.start, b.end) &&
    !conflicts(classBookings.get(classKey) ?? [], b.day, b.start, b.end);

  let slotCounter = 0;

  for (const dept of DEPARTMENTS) {
    for (const shift of dept.shifts) {
      for (let sem = 1; sem <= 8; sem++) {
        const semester = sem as SemesterNumber;
        const classKey = `${dept.id}-${shift}-${semester}`;
        const theoryRoom = `${dept.code}-${semester}${shift === "1st" ? "A" : "B"}`;
        const labRooms = [`${dept.code}-LAB1-${shift}`, `${dept.code}-LAB2-${shift}`];
        const session = SEMESTER_TO_SESSION[semester];

        const cellSubjects = SUBJECTS.filter(
          (s) => s.departmentId === dept.id && s.semester === semester,
        );

        // Rotate the day/period starting point per cell so classes aren't
        // all crammed onto Sunday — purely for a realistic-looking grid.
        let dayCursor = (sem + (shift === "1st" ? 0 : 2)) % CLASS_DAYS.length;
        let periodCursor = sem % PERIODS[shift].length;

        for (const subject of cellSubjects) {
          const assignment = COURSE_ASSIGNMENTS.find(
            (a) => a.subjectId === subject.id && a.shift === shift,
          );
          if (!assignment) continue;
          const teacherId = assignment.teacherId;

          const sessionsNeeded: { kind: "theory" | "practical" }[] =
            subject.type === "theory"
              ? [{ kind: "theory" }, { kind: "theory" }]
              : subject.type === "practical"
              ? [{ kind: "practical" }]
              : [{ kind: "theory" }, { kind: "practical" }];

          for (const need of sessionsNeeded) {
            let placed = false;
            for (let attempt = 0; attempt < CLASS_DAYS.length * PERIODS[shift].length && !placed; attempt++) {
              const day = CLASS_DAYS[dayCursor % CLASS_DAYS.length];

              if (need.kind === "theory") {
                const p = PERIODS[shift][periodCursor % PERIODS[shift].length];
                const booking: Booking = { day, start: p.start, end: p.end };
                if (isFree(teacherId, theoryRoom, classKey, booking)) {
                  bookAll(teacherId, theoryRoom, classKey, booking);
                  slots.push({
                    id: `rt-${++slotCounter}`,
                    departmentId: dept.id,
                    semester,
                    shift,
                    session,
                    day,
                    startTime: p.start,
                    endTime: p.end,
                    subjectId: subject.id,
                    teacherId,
                    room: theoryRoom,
                    kind: "theory",
                  });
                  placed = true;
                }
              } else {
                for (const [a, b] of DOUBLE_BLOCKS) {
                  const start = PERIODS[shift][a].start;
                  const end = PERIODS[shift][b].end;
                  const booking: Booking = { day, start, end };
                  const room = labRooms[slotCounter % labRooms.length];
                  if (isFree(teacherId, room, classKey, booking)) {
                    bookAll(teacherId, room, classKey, booking);
                    slots.push({
                      id: `rt-${++slotCounter}`,
                      departmentId: dept.id,
                      semester,
                      shift,
                      session,
                      day,
                      startTime: start,
                      endTime: end,
                      subjectId: subject.id,
                      teacherId,
                      room,
                      kind: "practical",
                    });
                    placed = true;
                    break;
                  }
                }
              }

              dayCursor++;
              if (dayCursor % CLASS_DAYS.length === 0) periodCursor++;
            }
          }
        }
      }
    }
  }

  return slots;
}

export const ROUTINE_SLOTS: RoutineSlot[] = buildRoutine();
