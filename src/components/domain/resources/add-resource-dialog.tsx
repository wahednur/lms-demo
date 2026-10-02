"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import type { CourseAssignment, ResourceType, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { resourceService } from "@/services";
import { randomFileSizeKb } from "@/lib/async";
import { useSession } from "@/components/shared/session-provider";

const schema = z.object({
  titleEn: z.string().min(1, "form.required"),
  titleBn: z.string().min(1, "form.required"),
  type: z.enum(["lecture-note", "assignment", "syllabus", "other"]),
  subjectId: z.string().min(1, "form.required"),
  fileName: z.string().min(1, "form.required"),
});
type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS: { value: ResourceType; label: { en: string; bn: string } }[] = [
  { value: "lecture-note", label: { en: "Lecture note", bn: "লেকচার নোট" } },
  { value: "assignment", label: { en: "Assignment", bn: "অ্যাসাইনমেন্ট" } },
  { value: "syllabus", label: { en: "Syllabus", bn: "সিলেবাস" } },
  { value: "other", label: { en: "Other", bn: "অন্যান্য" } },
];

export function AddResourceDialog({
  assignments,
  subjectById,
  onCreated,
}: {
  assignments: CourseAssignment[];
  subjectById: Map<string, Subject>;
  onCreated: () => void;
}) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "lecture-note", subjectId: assignments[0]?.subjectId ?? "" },
  });

  const subjectOptions = Array.from(new Set(assignments.map((a) => a.subjectId)))
    .map((id) => subjectById.get(id))
    .filter((s): s is Subject => !!s);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      await resourceService.create(
        {
          title: { en: values.titleEn, bn: values.titleBn },
          type: values.type,
          subjectId: values.subjectId,
          teacherId: user.linkedStaffId ?? "",
          fileName: values.fileName,
          fileSizeKb: randomFileSizeKb(),
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
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          {t("action.addNew")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{locale === "bn" ? "নতুন রিসোর্স যোগ করুন" : "Add new resource"}</DialogTitle>
          <DialogDescription>
            {locale === "bn"
              ? "এটি একটি ডেমো — কোনো প্রকৃত ফাইল আপলোড হয় না, শুধু ফাইলের নাম সংরক্ষিত হয়।"
              : "This is a demo — no real file is uploaded, only the file name is recorded."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="titleEn" className="mb-1.5">{locale === "bn" ? "শিরোনাম (ইংরেজি)" : "Title (English)"}</Label>
              <Input id="titleEn" {...register("titleEn")} aria-invalid={!!errors.titleEn} />
              {errors.titleEn && <p className="mt-1 text-xs text-danger">{t("form.required")}</p>}
            </div>
            <div>
              <Label htmlFor="titleBn" className="mb-1.5">{locale === "bn" ? "শিরোনাম (বাংলা)" : "Title (Bangla)"}</Label>
              <Input id="titleBn" {...register("titleBn")} aria-invalid={!!errors.titleBn} />
              {errors.titleBn && <p className="mt-1 text-xs text-danger">{t("form.required")}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5">{locale === "bn" ? "ধরন" : "Type"}</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{bilingual(o.label)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label className="mb-1.5">{t("common.subject")}</Label>
              <Controller
                control={control}
                name="subjectId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{bilingual(s.name)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="fileName" className="mb-1.5">{locale === "bn" ? "ফাইলের নাম" : "File name"}</Label>
            <Input id="fileName" placeholder="lecture-01.pdf" {...register("fileName")} aria-invalid={!!errors.fileName} />
            {errors.fileName && <p className="mt-1 text-xs text-danger">{t("form.required")}</p>}
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
