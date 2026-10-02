import { z } from "zod";

const phoneRegex = /^01[3-9]\d{8}$/; // Bangladeshi mobile format, demo-only strictness

export const studentFormSchema = z.object({
  nameBn: z.string().min(1, "form.required").max(100, "form.tooLong"),
  nameEn: z.string().min(1, "form.required").max(100, "form.tooLong"),
  roll: z
    .string()
    .min(1, "form.required")
    .max(10, "form.tooLong")
    .regex(/^[0-9]{1,6}$/, "form.required"),
  registrationNo: z.string().min(1, "form.required").max(20, "form.tooLong"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(1, "form.required"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"]),
  phone: z.string().regex(phoneRegex, "form.invalidPhone"),
  email: z.string().email("form.invalidEmail").or(z.literal("")),
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
  session: z.string().min(1, "form.required"),
  shift: z.enum(["1st", "2nd"]),
  fatherNameBn: z.string().min(1, "form.required"),
  fatherNameEn: z.string().min(1, "form.required"),
  motherNameBn: z.string().min(1, "form.required"),
  motherNameEn: z.string().min(1, "form.required"),
  guardianPhone: z.string().regex(phoneRegex, "form.invalidPhone"),
  presentAddressBn: z.string().min(1, "form.required"),
  presentAddressEn: z.string().min(1, "form.required"),
  permanentAddressBn: z.string().min(1, "form.required"),
  permanentAddressEn: z.string().min(1, "form.required"),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
