import { z } from "zod";

export const examinationFormSchema = z.object({
  nameEn: z.string().min(1, "form.required"),
  nameBn: z.string().min(1, "form.required"),
  type: z.enum(["class-test", "midterm", "sessional", "semester-final"]),
  departmentId: z.string().min(1, "form.required"),
  semester: z.union([
    z.literal(1), z.literal(2), z.literal(3), z.literal(4),
    z.literal(5), z.literal(6), z.literal(7), z.literal(8),
  ]),
  shift: z.enum(["1st", "2nd"]),
  session: z.string().min(1, "form.required"),
  subjectIds: z.array(z.string()).min(1, "form.required"),
  startDate: z.string().min(1, "form.required"),
  endDate: z.string().min(1, "form.required"),
});
export type ExaminationFormValues = z.infer<typeof examinationFormSchema>;
