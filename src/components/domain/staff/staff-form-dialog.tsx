"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
import type { Department, Staff } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { staffFormSchema, type StaffFormValues } from "@/lib/validation/staff";
import { useLanguage } from "@/lib/i18n/context";
import { staffService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

const DESIGNATIONS: { value: Staff["designation"]; label: { en: string; bn: string } }[] = [
  { value: "chief-instructor", label: { en: "Chief Instructor", bn: "চীফ ইন্সট্রাক্টর" } },
  { value: "instructor", label: { en: "Instructor", bn: "ইন্সট্রাক্টর" } },
  { value: "junior-instructor", label: { en: "Junior Instructor", bn: "জুনিয়র ইন্সট্রাক্টর" } },
  { value: "workshop-super", label: { en: "Workshop Super", bn: "ওয়ার্কশপ সুপার" } },
  { value: "principal", label: { en: "Principal (Additional Responsibility)", bn: "অধ্যক্ষ (অতিরিক্ত দায়িত্ব)" } },
  { value: "vice-principal", label: { en: "Vice Principal", bn: "উপাধ্যক্ষ" } },
  { value: "registrar", label: { en: "Registrar", bn: "রেজিস্ট্রার" } },
  { value: "office-staff", label: { en: "Office Staff", bn: "অফিস স্টাফ" } },
];

function toFormValues(s: Staff): StaffFormValues {
  return {
    nameBn: s.name.bn,
    nameEn: s.name.en,
    designation: s.designation,
    departmentId: s.departmentId,
    shift: s.shift,
    phone: s.phone,
    email: s.email,
    joiningDate: s.joiningDate,
    status: s.status,
  };
}

const EMPTY: StaffFormValues = {
  nameBn: "", nameEn: "", designation: "junior-instructor", departmentId: null, shift: "1st",
  phone: "", email: "", joiningDate: "", status: "active",
};

export function StaffFormDialog({
  staff,
  departments,
  onSaved,
}: {
  staff?: Staff;
  departments: Department[];
  onSaved: () => void;
}) {
  const { t, locale } = useLanguage();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const isEdit = !!staff;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: staff ? toFormValues(staff) : EMPTY,
  });

  useEffect(() => {
    if (open) reset(staff ? toFormValues(staff) : EMPTY);
  }, [open, staff, reset]);

  const onSubmit = async (values: StaffFormValues) => {
    if (!user) return;
    try {
      if (isEdit && staff) {
        await staffService.update(staff.id, values, user.id);
      } else {
        await staffService.create(values, user.id);
      }
      toast.success(t("feedback.saved"));
      setOpen(false);
      onSaved();
    } catch {
      toast.error(t("feedback.saveFailed"));
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? (locale === "bn" ? "প্রোফাইল সম্পাদনা" : "Edit profile") : (locale === "bn" ? "নতুন কর্মী যোগ করুন" : "Add new staff")}</DialogTitle>
          <DialogDescription>
            {locale === "bn" ? "সকল তথ্য কাল্পনিক ডেমো ডেটা হিসেবে সংরক্ষিত হবে।" : "All information is stored as fictional demo data."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
          <FormField label={locale === "bn" ? "নাম (বাংলা)" : "Name (Bangla)"} error={errors.nameBn}><Input {...register("nameBn")} /></FormField>
          <FormField label={locale === "bn" ? "নাম (ইংরেজি)" : "Name (English)"} error={errors.nameEn}><Input {...register("nameEn")} /></FormField>

          <FormField label={locale === "bn" ? "পদবী" : "Designation"} error={errors.designation}>
            <Controller control={control} name="designation" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map((d) => <SelectItem key={d.value} value={d.value}>{locale === "bn" ? d.label.bn : d.label.en}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <FormField label={t("common.department")} optional>
            <Controller control={control} name="departmentId" render={({ field }) => (
              <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{locale === "bn" ? "কেন্দ্রীয় প্রশাসন" : "Central administration"}</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{locale === "bn" ? d.name.bn : d.name.en}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </FormField>

          <FormField label={t("common.shift")} optional>
            <Controller control={control} name="shift" render={({ field }) => (
              <Select value={field.value ?? "both"} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">{locale === "bn" ? "১ম শিফট" : "1st Shift"}</SelectItem>
                  <SelectItem value="2nd">{locale === "bn" ? "২য় শিফট" : "2nd Shift"}</SelectItem>
                  <SelectItem value="both">{locale === "bn" ? "উভয় শিফট" : "Both shifts"}</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <FormField label={locale === "bn" ? "যোগদানের তারিখ" : "Joining Date"} error={errors.joiningDate}>
            <Input type="date" {...register("joiningDate")} />
          </FormField>

          <FormField label={locale === "bn" ? "ফোন" : "Phone"} error={errors.phone}><Input {...register("phone")} placeholder="01XXXXXXXXX" /></FormField>
          <FormField label={locale === "bn" ? "ইমেইল" : "Email"} error={errors.email}><Input {...register("email")} /></FormField>

          <FormField label={locale === "bn" ? "অবস্থা" : "Status"}>
            <Controller control={control} name="status" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </FormField>

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
