import { z } from "zod";

const phoneRegex = /^01[3-9]\d{8}$/;

export const staffFormSchema = z.object({
  nameBn: z.string().min(1, "form.required").max(100, "form.tooLong"),
  nameEn: z.string().min(1, "form.required").max(100, "form.tooLong"),
  designation: z.enum([
    "chief-instructor",
    "instructor",
    "junior-instructor",
    "workshop-super",
    "principal",
    "vice-principal",
    "registrar",
    "office-staff",
  ]),
  departmentId: z.string().nullable(),
  shift: z.union([z.literal("1st"), z.literal("2nd"), z.literal("both"), z.null()]),
  phone: z.string().regex(phoneRegex, "form.invalidPhone"),
  email: z.string().email("form.invalidEmail"),
  joiningDate: z.string().min(1, "form.required"),
  status: z.enum(["active", "inactive"]),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;
