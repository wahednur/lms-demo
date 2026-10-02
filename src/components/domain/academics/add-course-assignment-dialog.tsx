"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import type { Staff, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { academicService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

const schema = z.object({
  subjectId: z.string().min(1, "form.required"),
  teacherId: z.string().min(1, "form.required"),
  shift: z.enum(["1st", "2nd"]),
  session: z.string().min(1, "form.required"),
});
type FormValues = z.infer<typeof schema>;

export function AddCourseAssignmentDialog({
  subjects,
  teachers,
  sessions,
  onAdded,
}: {
  subjects: Subject[];
  teachers: Staff[];
  sessions: string[];
  onAdded: () => void;
}) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const { handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { subjectId: subjects[0]?.id ?? "", teacherId: teachers[0]?.id ?? "", shift: "1st", session: sessions[0] ?? "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    const subject = subjects.find((s) => s.id === values.subjectId);
    if (!subject) return;
    try {
      await academicService.createCourseAssignment(
        {
          subjectId: subject.id,
          teacherId: values.teacherId,
          departmentId: subject.departmentId,
          semester: subject.semester,
          shift: values.shift,
          session: values.session,
        },
        user.id,
      );
      toast.success(t("feedback.saved"));
      reset();
      setOpen(false);
      onAdded();
    } catch {
      toast.error(t("feedback.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="size-4" />{locale === "bn" ? "নতুন বণ্টন" : "New assignment"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{locale === "bn" ? "শিক্ষক-বিষয় বণ্টন" : "Teacher–Subject Assignment"}</DialogTitle>
          <DialogDescription>
            {locale === "bn" ? "বিভাগ ও সেমিস্টার নির্বাচিত বিষয় থেকে স্বয়ংক্রিয়ভাবে নির্ধারিত হবে।" : "Department and semester are taken automatically from the selected subject."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <FormField label={t("common.subject")} error={errors.subjectId}>
            <Controller control={control} name="subjectId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {bilingual(s.name)}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <FormField label={t("common.teacher")} error={errors.teacherId}>
            <Controller control={control} name="teacherId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {teachers.map((s) => <SelectItem key={s.id} value={s.id}>{bilingual(s.name)}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
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
            <FormField label={t("common.session")} error={errors.session}>
              <Controller control={control} name="session" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </FormField>
          </div>
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
