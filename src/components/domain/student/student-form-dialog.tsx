"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
import type { Department, SemesterNumber, Student } from "@/types";
import { ServiceError } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormField } from "@/components/shared/form-field";
import { studentFormSchema, type StudentFormValues } from "@/lib/validation/student";
import { useLanguage } from "@/lib/i18n/context";
import { studentService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

function toFormValues(s: Student): StudentFormValues {
  return {
    nameBn: s.name.bn,
    nameEn: s.name.en,
    roll: s.roll,
    registrationNo: s.registrationNo,
    gender: s.gender,
    dateOfBirth: s.dateOfBirth,
    bloodGroup: s.bloodGroup,
    phone: s.phone,
    email: s.email,
    departmentId: s.departmentId,
    semester: s.semester,
    session: s.session,
    shift: s.shift,
    fatherNameBn: s.guardian.fatherName.bn,
    fatherNameEn: s.guardian.fatherName.en,
    motherNameBn: s.guardian.motherName.bn,
    motherNameEn: s.guardian.motherName.en,
    guardianPhone: s.guardian.guardianPhone,
    presentAddressBn: s.guardian.presentAddress.bn,
    presentAddressEn: s.guardian.presentAddress.en,
    permanentAddressBn: s.guardian.permanentAddress.bn,
    permanentAddressEn: s.guardian.permanentAddress.en,
  };
}

/**
 * Builds "new student" defaults from the CURRENT departments/sessions props
 * — not a static empty-string constant. A blank departmentId/session looks
 * like "no choice made yet" in the Select (shows the placeholder) but is
 * actually an invalid value that silently blocks submission with no
 * visible error (the error lands on a tab the user may not be looking at).
 * Defaulting to the first real option avoids that trap entirely.
 */
function emptyValues(departments: Department[], sessions: string[]): StudentFormValues {
  return {
    nameBn: "", nameEn: "", roll: "", registrationNo: "", gender: "male", dateOfBirth: "",
    bloodGroup: "unknown", phone: "", email: "", departmentId: departments[0]?.id ?? "",
    semester: 1, session: sessions[0] ?? "",
    shift: "1st", fatherNameBn: "", fatherNameEn: "", motherNameBn: "", motherNameEn: "",
    guardianPhone: "", presentAddressBn: "", presentAddressEn: "", permanentAddressBn: "", permanentAddressEn: "",
  };
}

export function StudentFormDialog({
  student,
  departments,
  sessions,
  onSaved,
}: {
  student?: Student;
  departments: Department[];
  sessions: string[];
  onSaved: () => void;
}) {
  const { t, locale } = useLanguage();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const isEdit = !!student;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: student ? toFormValues(student) : emptyValues(departments, sessions),
  });

  useEffect(() => {
    if (open) reset(student ? toFormValues(student) : emptyValues(departments, sessions));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the dialog opens or the edited student changes, not on every departments/sessions re-fetch
  }, [open, student, reset]);

  const onSubmit = async (values: StudentFormValues) => {
    if (!user) return;
    try {
      if (isEdit && student) {
        await studentService.update(student.id, values, user.id);
        toast.success(t("feedback.saved"));
      } else {
        await studentService.create(values, user.id);
        toast.success(locale === "bn" ? "শিক্ষার্থী সফলভাবে নিবন্ধিত হয়েছে। লগইন অ্যাকাউন্টও তৈরি হয়েছে।" : "Student registered successfully. A login account was also provisioned.");
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      if (err instanceof ServiceError && err.code === "CONFLICT") {
        toast.error(locale === "bn" ? err.message === "form.duplicateRoll" ? "এই রোল নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে।" : "এই রেজিস্ট্রেশন নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে।" : err.message === "form.duplicateRoll" ? "This roll number is already in use." : "This registration number is already in use.");
      } else {
        toast.error(t("feedback.saveFailed"));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm" className="gap-1.5"><Pencil className="size-3.5" />{t("action.edit")}</Button>
        ) : (
          <Button size="sm" className="gap-1.5"><Plus className="size-4" />{t("action.addNew")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? (locale === "bn" ? "শিক্ষার্থীর তথ্য সম্পাদনা" : "Edit student") : (locale === "bn" ? "নতুন শিক্ষার্থী নিবন্ধন" : "Register new student")}</DialogTitle>
          <DialogDescription>
            {locale === "bn" ? "সকল তথ্য কাল্পনিক ডেমো ডেটা হিসেবে সংরক্ষিত হবে।" : "All information is stored as fictional demo data."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal">{locale === "bn" ? "ব্যক্তিগত" : "Personal"}</TabsTrigger>
              <TabsTrigger value="academic">{locale === "bn" ? "একাডেমিক" : "Academic"}</TabsTrigger>
              <TabsTrigger value="guardian">{locale === "bn" ? "অভিভাবক" : "Guardian"}</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="grid gap-3 pt-3 sm:grid-cols-2">
              <FormField label={locale === "bn" ? "নাম (বাংলা)" : "Name (Bangla)"} error={errors.nameBn}>
                <Input {...register("nameBn")} />
              </FormField>
              <FormField label={locale === "bn" ? "নাম (ইংরেজি)" : "Name (English)"} error={errors.nameEn}>
                <Input {...register("nameEn")} />
              </FormField>
              <FormField label={locale === "bn" ? "জন্ম তারিখ" : "Date of Birth"} error={errors.dateOfBirth}>
                <Input type="date" {...register("dateOfBirth")} />
              </FormField>
              <FormField label={locale === "bn" ? "লিঙ্গ" : "Gender"} error={errors.gender}>
                <Controller control={control} name="gender" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{locale === "bn" ? "পুরুষ" : "Male"}</SelectItem>
                      <SelectItem value="female">{locale === "bn" ? "মহিলা" : "Female"}</SelectItem>
                      <SelectItem value="other">{locale === "bn" ? "অন্যান্য" : "Other"}</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label={locale === "bn" ? "রক্তের গ্রুপ" : "Blood Group"} error={errors.bloodGroup}>
                <Controller control={control} name="bloodGroup" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"].map((bg) => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label={locale === "bn" ? "ফোন" : "Phone"} error={errors.phone}>
                <Input {...register("phone")} placeholder="01XXXXXXXXX" />
              </FormField>
              <FormField label={locale === "bn" ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)"} error={errors.email}>
                <Input {...register("email")} />
              </FormField>
            </TabsContent>

            <TabsContent value="academic" className="grid gap-3 pt-3 sm:grid-cols-2">
              <FormField label={locale === "bn" ? "রোল" : "Roll"} error={errors.roll}>
                <Input {...register("roll")} />
              </FormField>
              <FormField label={locale === "bn" ? "রেজিস্ট্রেশন নম্বর" : "Registration No."} error={errors.registrationNo}>
                <Input {...register("registrationNo")} />
              </FormField>
              <FormField label={t("common.department")} error={errors.departmentId}>
                <Controller control={control} name="departmentId" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={t("form.selectOption")} /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{locale === "bn" ? d.name.bn : d.name.en}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label={t("common.semester")} error={errors.semester}>
                <Controller control={control} name="semester" render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v) as SemesterNumber)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label={t("common.session")} error={errors.session}>
                <Controller control={control} name="session" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={t("form.selectOption")} /></SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
              <FormField label={t("common.shift")} error={errors.shift}>
                <Controller control={control} name="shift" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st">{locale === "bn" ? "১ম শিফট" : "1st Shift"}</SelectItem>
                      <SelectItem value="2nd">{locale === "bn" ? "২য় শিফট" : "2nd Shift"}</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </FormField>
            </TabsContent>

            <TabsContent value="guardian" className="grid gap-3 pt-3 sm:grid-cols-2">
              <FormField label={locale === "bn" ? "পিতার নাম (বাংলা)" : "Father's Name (Bangla)"} error={errors.fatherNameBn}><Input {...register("fatherNameBn")} /></FormField>
              <FormField label={locale === "bn" ? "পিতার নাম (ইংরেজি)" : "Father's Name (English)"} error={errors.fatherNameEn}><Input {...register("fatherNameEn")} /></FormField>
              <FormField label={locale === "bn" ? "মাতার নাম (বাংলা)" : "Mother's Name (Bangla)"} error={errors.motherNameBn}><Input {...register("motherNameBn")} /></FormField>
              <FormField label={locale === "bn" ? "মাতার নাম (ইংরেজি)" : "Mother's Name (English)"} error={errors.motherNameEn}><Input {...register("motherNameEn")} /></FormField>
              <FormField label={locale === "bn" ? "অভিভাবকের ফোন" : "Guardian Phone"} error={errors.guardianPhone}><Input {...register("guardianPhone")} /></FormField>
              <div />
              <FormField label={locale === "bn" ? "বর্তমান ঠিকানা (বাংলা)" : "Present Address (Bangla)"} error={errors.presentAddressBn}><Input {...register("presentAddressBn")} /></FormField>
              <FormField label={locale === "bn" ? "বর্তমান ঠিকানা (ইংরেজি)" : "Present Address (English)"} error={errors.presentAddressEn}><Input {...register("presentAddressEn")} /></FormField>
              <FormField label={locale === "bn" ? "স্থায়ী ঠিকানা (বাংলা)" : "Permanent Address (Bangla)"} error={errors.permanentAddressBn}><Input {...register("permanentAddressBn")} /></FormField>
              <FormField label={locale === "bn" ? "স্থায়ী ঠিকানা (ইংরেজি)" : "Permanent Address (English)"} error={errors.permanentAddressEn}><Input {...register("permanentAddressEn")} /></FormField>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {t("action.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
