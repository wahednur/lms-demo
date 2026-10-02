import { z } from "zod";

/** A single mark field validated against a dynamic max — built per-subject
 * at the call site since each subject configures its own tc/pc/tf/pf caps
 * (see types/academic.ts Subject.maxMarks). */
export function markFieldSchema(max: number) {
  return z
    .number({ message: "form.required" })
    .min(0, "form.markBelowZero")
    .max(max, "form.markExceedsMax")
    .nullable();
}

export const returnForCorrectionSchema = z.object({
  reason: z.string().min(10, "form.required").max(500, "form.tooLong"),
});

export type ReturnForCorrectionValues = z.infer<typeof returnForCorrectionSchema>;
