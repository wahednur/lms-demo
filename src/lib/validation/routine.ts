import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const routineSlotFormSchema = z
  .object({
    departmentId: z.string().min(1, "form.required"),
    semester: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
      z.literal(7),
      z.literal(8),
    ]),
    shift: z.enum(["1st", "2nd"]),
    session: z.string().min(1, "form.required"),
    day: z.enum([
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
    ]),
    startTime: z.string().regex(timeRegex, "form.required"),
    endTime: z.string().regex(timeRegex, "form.required"),
    subjectId: z.string().min(1, "form.required"),
    teacherId: z.string().min(1, "form.required"),
    room: z.string().min(1, "form.required"),
    kind: z.enum(["theory", "practical"]),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "form.required",
    path: ["endTime"],
  });

export type RoutineSlotFormValues = z.infer<typeof routineSlotFormSchema>;

/** Parses "HH:mm" into minutes-since-midnight for interval comparisons —
 * conflict checks must never compare raw time strings (brief §8/G). */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}
