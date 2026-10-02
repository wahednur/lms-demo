import type { SemesterNumber, SessionLabel, Shift } from "./common";

export type Weekday =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export const WEEKDAYS: Weekday[] = [
  "saturday",
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

/** One scheduled slot in the weekly routine. Time stored as "HH:mm" 24h
 * strings; conflict checks compare parsed minute ranges, never raw strings. */
export interface RoutineSlot {
  id: string;
  departmentId: string;
  semester: SemesterNumber;
  shift: Shift;
  session: SessionLabel;
  day: Weekday;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  subjectId: string;
  teacherId: string;
  room: string;
  kind: "theory" | "practical";
}

export interface RoutineConflict {
  type: "teacher" | "room" | "class";
  message: string;
  withSlotId: string;
}
