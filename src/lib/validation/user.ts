import { z } from "zod";

export const userFormSchema = z.object({
  nameBn: z.string().min(1, "form.required").max(100, "form.tooLong"),
  nameEn: z.string().min(1, "form.required").max(100, "form.tooLong"),
  email: z.string().email("form.invalidEmail"),
  role: z.enum(["principal", "academic_incharge", "hod", "teacher", "student"]),
  linkedStaffId: z.string().optional(),
  linkedStudentId: z.string().optional(),
  departmentId: z.string().nullable().optional(),
  active: z.boolean(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
