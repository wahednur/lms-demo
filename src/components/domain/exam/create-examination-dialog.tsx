"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import type { Department, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { examinationFormSchema, type ExaminationFormValues } from "@/lib/validation/examination";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { examService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

export function CreateExaminationDialog({
  departments,
  subjects,
  sessions,
  onCreated,
}: {
  departments: Department[];
  subjects: Subject[];
  sessions: string[];
  onCreated: () => void;
}) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationFormSchema),
    defaultValues: {
      type: "sessional", departmentId: departments[0]?.id ?? "", semester: 1, shift: "1st",
      session: sessions[0] ?? "", subjectIds: [], startDate: "", endDate: "",
    },
  });

  const departmentId = watch("departmentId");
  const semester = watch("semester");
  const subjectIds = watch("subjectIds") ?? [];
  const eligibleSubjects = subjects.filter((s) => s.departmentId === departmentId && s.semester === semester);

  const onSubmit = async (values: ExaminationFormValues) => {
    if (!user) return;
    try {
      await examService.createExamination(
        {
          name: { en: values.nameEn, bn: values.nameBn },
          type: values.type,
          departmentId: values.departmentId,
          semester: values.semester,
          shift: values.shift,
          session: values.session,
          subjectIds: values.subjectIds,
          startDate: values.startDate,
          endDate: values.endDate,
        },
        user.id,
      );
      toast.success(t("feedback.saved"));
      reset();
      setOpen(false);
      onCreated();
    } catch {
      toast.error(t("feedback.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="size-4" />{locale === "bn" ? "নতুন পরীক্ষা" : "New examination"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{locale === "bn" ? "পরীক্ষা সেটআপ" : "Examination setup"}</DialogTitle>
          <DialogDescription>{locale === "bn" ? "একটি পরীক্ষার আওতায় একাধিক বিষয় অন্তর্ভুক্ত করা যাবে।" : "An examination can cover multiple subjects."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={locale === "bn" ? "নাম (ইংরেজি)" : "Name (English)"} error={errors.nameEn}><Input {...register("nameEn")} /></FormField>
            <FormField label={locale === "bn" ? "নাম (বাংলা)" : "Name (Bangla)"} error={errors.nameBn}><Input {...register("nameBn")} /></FormField>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={locale === "bn" ? "ধরন" : "Type"} error={errors.type}>
              <Controller control={control} name="type" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class-test">{locale === "bn" ? "ক্লাস টেস্ট" : "Class Test"}</SelectItem>
                    <SelectItem value="midterm">{locale === "bn" ? "মিডটার্ম" : "Midterm"}</SelectItem>
                    <SelectItem value="sessional">{locale === "bn" ? "সেশনাল" : "Sessional"}</SelectItem>
                    <SelectItem value="semester-final">{locale === "bn" ? "সেমিস্টার ফাইনাল" : "Semester Final"}</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </FormField>
            <FormField label={t("common.department")} error={errors.departmentId}>
              <Controller control={control} name="departmentId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </FormField>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label={t("common.semester")} error={errors.semester}>
              <Controller control={control} name="semester" render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </FormField>
            <FormField label={t("common.shift")} error={errors.shift}>
              <Controller control={control} name="shift" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st</SelectItem>
                    <SelectItem value="2nd">2nd</SelectItem>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={locale === "bn" ? "শুরুর তারিখ" : "Start date"} error={errors.startDate}><Input type="date" {...register("startDate")} /></FormField>
            <FormField label={locale === "bn" ? "শেষের তারিখ" : "End date"} error={errors.endDate}><Input type="date" {...register("endDate")} /></FormField>
          </div>
          <FormField label={locale === "bn" ? "বিষয়সমূহ" : "Subjects"} error={errors.subjectIds as { message?: string } | undefined}>
            <Controller control={control} name="subjectIds" render={({ field }) => (
              <div className="grid max-h-40 gap-1.5 overflow-y-auto rounded-md border border-border p-2">
                {eligibleSubjects.length === 0 ? (
                  <p className="p-2 text-xs text-muted-foreground">{locale === "bn" ? "এই বিভাগ ও সেমিস্টারে কোনো বিষয় নেই।" : "No subjects for this department and semester."}</p>
                ) : (
                  eligibleSubjects.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-accent">
                      <Checkbox
                        checked={subjectIds.includes(s.id)}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? [...subjectIds, s.id] : subjectIds.filter((id: string) => id !== s.id));
                        }}
                      />
                      {s.code} — {bilingual(s.name)}
                    </label>
                  ))
                )}
              </div>
            )} />
          </FormField>
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
