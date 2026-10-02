"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { useLanguage } from "@/lib/i18n/context";
import { staffService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

const schema = z.object({
  titleEn: z.string().min(1, "form.required"),
  titleBn: z.string().min(1, "form.required"),
  institutionEn: z.string().min(1, "form.required"),
  institutionBn: z.string().min(1, "form.required"),
  year: z.coerce.number().min(1990).max(2100),
  durationWeeks: z.coerce.number().min(1).max(52),
});
type FormValues = z.infer<typeof schema>;

export function AddTrainingDialog({ staffId, onAdded }: { staffId: string; onAdded: () => void }) {
  const { t, locale } = useLanguage();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { year: new Date().getFullYear(), durationWeeks: 2 },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      await staffService.addTraining(
        staffId,
        {
          title: { en: values.titleEn, bn: values.titleBn },
          institution: { en: values.institutionEn, bn: values.institutionBn },
          year: values.year,
          durationWeeks: values.durationWeeks,
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
        <Button variant="outline" size="sm" className="gap-1.5"><Plus className="size-3.5" />{locale === "bn" ? "প্রশিক্ষণ যোগ করুন" : "Add training"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{locale === "bn" ? "প্রশিক্ষণ রেকর্ড যোগ করুন" : "Add training record"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
          <FormField label={locale === "bn" ? "শিরোনাম (ইংরেজি)" : "Title (English)"} error={errors.titleEn}><Input {...register("titleEn")} /></FormField>
          <FormField label={locale === "bn" ? "শিরোনাম (বাংলা)" : "Title (Bangla)"} error={errors.titleBn}><Input {...register("titleBn")} /></FormField>
          <FormField label={locale === "bn" ? "প্রতিষ্ঠান (ইংরেজি)" : "Institution (English)"} error={errors.institutionEn}><Input {...register("institutionEn")} /></FormField>
          <FormField label={locale === "bn" ? "প্রতিষ্ঠান (বাংলা)" : "Institution (Bangla)"} error={errors.institutionBn}><Input {...register("institutionBn")} /></FormField>
          <FormField label={locale === "bn" ? "বছর" : "Year"} error={errors.year}><Input type="number" {...register("year")} /></FormField>
          <FormField label={locale === "bn" ? "মেয়াদ (সপ্তাহ)" : "Duration (weeks)"} error={errors.durationWeeks}><Input type="number" {...register("durationWeeks")} /></FormField>
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
