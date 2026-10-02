"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import type { CourseAssignment, Department, RoutineConflict, Staff, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/shared/form-field";
import { routineSlotFormSchema, type RoutineSlotFormValues } from "@/lib/validation/routine";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { routineService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday"] as const;
const WEEKDAY_LABEL: Record<string, { en: string; bn: string }> = {
  sunday: { en: "Sunday", bn: "রবিবার" },
  monday: { en: "Monday", bn: "সোমবার" },
  tuesday: { en: "Tuesday", bn: "মঙ্গলবার" },
  wednesday: { en: "Wednesday", bn: "বুধবার" },
  thursday: { en: "Thursday", bn: "বৃহস্পতিবার" },
};

export function AddRoutineSlotDialog({
  departments,
  assignments,
  subjectById,
  teacherById,
  sessions,
  onAdded,
}: {
  departments: Department[];
  assignments: CourseAssignment[];
  subjectById: Map<string, Subject>;
  teacherById: Map<string, Staff>;
  sessions: string[];
  onAdded: () => void;
}) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [conflicts, setConflicts] = useState<RoutineConflict[]>([]);
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoutineSlotFormValues>({
    resolver: zodResolver(routineSlotFormSchema),
    defaultValues: {
      departmentId: departments[0]?.id ?? "",
      semester: 1,
      shift: "1st",
      session: sessions[0] ?? "",
      day: "sunday",
      startTime: "08:00",
      endTime: "08:50",
      subjectId: "",
      teacherId: "",
      room: "",
      kind: "theory",
    },
  });

  const values = watch();
  const eligibleAssignments = assignments.filter(
    (a) => a.departmentId === values.departmentId && a.semester === values.semester && a.shift === values.shift,
  );

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      if (!values.startTime || !values.endTime || values.startTime >= values.endTime) {
        setConflicts([]);
        return;
      }
      setChecking(true);
      const result = await routineService.checkConflicts(values);
      setConflicts(result);
      setChecking(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [open, values.departmentId, values.semester, values.shift, values.session, values.day, values.startTime, values.endTime, values.teacherId, values.room]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (formValues: RoutineSlotFormValues) => {
    if (!user) return;
    try {
      const liveConflicts = await routineService.checkConflicts(formValues);
      if (liveConflicts.length > 0) {
        setConflicts(liveConflicts);
        toast.error(locale === "bn" ? "সময়সূচিতে দ্বন্দ্ব রয়েছে — সংরক্ষণ করা যাবে না।" : "Schedule conflict — cannot save.");
        return;
      }
      await routineService.createSlot(formValues, user.id);
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
        <Button size="sm" className="gap-1.5"><Plus className="size-4" />{locale === "bn" ? "নতুন ক্লাস স্লট" : "New class slot"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{locale === "bn" ? "ক্লাস রুটিন স্লট যোগ করুন" : "Add class routine slot"}</DialogTitle>
          <DialogDescription>{locale === "bn" ? "শিক্ষক, রুম বা ক্লাসের সময়ের দ্বন্দ্ব স্বয়ংক্রিয়ভাবে পরীক্ষা করা হবে।" : "Teacher, room, and class time conflicts are checked automatically."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label={t("common.department")} error={errors.departmentId}>
              <Controller control={control} name="departmentId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </FormField>
            <FormField label={t("common.semester")} error={errors.semester}>
              <Controller control={control} name="semester" render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </FormField>
            <FormField label={t("common.shift")} error={errors.shift}>
              <Controller control={control} name="shift" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1st">1st</SelectItem><SelectItem value="2nd">2nd</SelectItem></SelectContent>
                </Select>
              )} />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={t("common.session")} error={errors.session}>
              <Controller control={control} name="session" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{sessions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </FormField>
            <FormField label={locale === "bn" ? "বার" : "Day"} error={errors.day}>
              <Controller control={control} name="day" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{WEEKDAYS.map((d) => <SelectItem key={d} value={d}>{bilingual(WEEKDAY_LABEL[d])}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={locale === "bn" ? "শুরুর সময়" : "Start time"} error={errors.startTime}><Input type="time" {...register("startTime")} /></FormField>
            <FormField label={locale === "bn" ? "শেষের সময়" : "End time"} error={errors.endTime}><Input type="time" {...register("endTime")} /></FormField>
          </div>

          <FormField label={t("common.subject")} error={errors.subjectId}>
            <Controller control={control} name="subjectId" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => {
                field.onChange(v);
                const assignment = eligibleAssignments.find((a) => a.subjectId === v);
                if (assignment) setValue("teacherId", assignment.teacherId);
              }}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("form.selectOption")} /></SelectTrigger>
                <SelectContent>
                  {eligibleAssignments.map((a) => {
                    const s = subjectById.get(a.subjectId);
                    return <SelectItem key={a.subjectId} value={a.subjectId}>{s ? `${s.code} — ${bilingual(s.name)}` : a.subjectId}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            )} />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={t("common.teacher")} error={errors.teacherId}>
              <Controller control={control} name="teacherId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t("form.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    {eligibleAssignments.map((a) => {
                      const tch = teacherById.get(a.teacherId);
                      return <SelectItem key={a.teacherId} value={a.teacherId}>{tch ? bilingual(tch.name) : a.teacherId}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              )} />
            </FormField>
            <FormField label={t("common.room")} error={errors.room}><Input {...register("room")} placeholder="CST-501" /></FormField>
          </div>

          <FormField label={locale === "bn" ? "ক্লাসের ধরন" : "Class kind"} error={errors.kind}>
            <Controller control={control} name="kind" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">{locale === "bn" ? "থিওরি" : "Theory"}</SelectItem>
                  <SelectItem value="practical">{locale === "bn" ? "প্র্যাকটিক্যাল" : "Practical"}</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </FormField>

          {checking && <p className="text-xs text-muted-foreground">{locale === "bn" ? "দ্বন্দ্ব পরীক্ষা করা হচ্ছে…" : "Checking for conflicts…"}</p>}
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <ul className="list-disc space-y-1 pl-4">
                  {conflicts.map((c, i) => <li key={i}>{c.message}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || conflicts.length > 0} className="gap-1.5">
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {t("action.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
