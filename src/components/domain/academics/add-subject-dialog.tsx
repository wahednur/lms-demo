"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import type { Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { useLanguage } from "@/lib/i18n/context";
import { academicService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

const schema = z.object({
  code: z.string().min(1, "form.required"),
  nameEn: z.string().min(1, "form.required"),
  nameBn: z.string().min(1, "form.required"),
  departmentId: z.string().min(1, "form.required"),
  semester: z.coerce.number().min(1).max(8),
  type: z.enum(["theory", "practical", "both"]),
  credit: z.coerce.number().min(1).max(6),
  tc: z.coerce.number().min(0).max(100),
  pc: z.coerce.number().min(0).max(100),
  tf: z.coerce.number().min(0).max(100),
  pf: z.coerce.number().min(0).max(100),
});
type FormValues = z.infer<typeof schema>;

export function AddSubjectDialog({ departments, onAdded }: { departments: Department[]; onAdded: () => void }) {
  const { t, locale } = useLanguage();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { semester: 1, type: "theory", credit: 3, tc: 25, pc: 0, tf: 75, pf: 0, departmentId: departments[0]?.id ?? "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      await academicService.createSubject(
        {
          code: values.code,
          name: { en: values.nameEn, bn: values.nameBn },
          departmentId: values.departmentId,
          semester: values.semester as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
          type: values.type,
          credit: values.credit,
          maxMarks: { tc: values.tc, pc: values.pc, tf: values.tf, pf: values.pf },
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
        <Button size="sm" className="gap-1.5"><Plus className="size-4" />{locale === "bn" ? "নতুন বিষয়" : "New subject"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{locale === "bn" ? "নতুন বিষয় যোগ করুন" : "Add new subject"}</DialogTitle>
          <DialogDescription>
            {locale === "bn" ? "বিষয় কোড উদাহরণস্বরূপ — প্রকৃত বিটিইবি কোড নয়।" : "Subject codes are illustrative — not official BTEB codes."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
          <FormField label={locale === "bn" ? "বিষয় কোড" : "Subject code"} error={errors.code}><Input {...register("code")} placeholder="CST-9901" /></FormField>
          <FormField label={t("common.department")} error={errors.departmentId}>
            <Controller control={control} name="departmentId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{locale === "bn" ? d.name.bn : d.name.en}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <FormField label={locale === "bn" ? "নাম (ইংরেজি)" : "Name (English)"} error={errors.nameEn}><Input {...register("nameEn")} /></FormField>
          <FormField label={locale === "bn" ? "নাম (বাংলা)" : "Name (Bangla)"} error={errors.nameBn}><Input {...register("nameBn")} /></FormField>
          <FormField label={t("common.semester")} error={errors.semester}><Input type="number" min={1} max={8} {...register("semester")} /></FormField>
          <FormField label={locale === "bn" ? "ক্রেডিট" : "Credit"} error={errors.credit}><Input type="number" min={1} max={6} {...register("credit")} /></FormField>
          <FormField label={locale === "bn" ? "ধরন" : "Type"} error={errors.type}>
            <Controller control={control} name="type" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">{locale === "bn" ? "থিওরি" : "Theory"}</SelectItem>
                  <SelectItem value="practical">{locale === "bn" ? "প্র্যাকটিক্যাল" : "Practical"}</SelectItem>
                  <SelectItem value="both">{locale === "bn" ? "থিওরি + প্র্যাকটিক্যাল" : "Theory + Practical"}</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <div />
          <FormField label="TC"><Input type="number" min={0} max={100} {...register("tc")} /></FormField>
          <FormField label="PC"><Input type="number" min={0} max={100} {...register("pc")} /></FormField>
          <FormField label="TF"><Input type="number" min={0} max={100} {...register("tf")} /></FormField>
          <FormField label="PF"><Input type="number" min={0} max={100} {...register("pf")} /></FormField>
          <DialogFooter className="sm:col-span-2">
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
