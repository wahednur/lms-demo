"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
import type { Department, SystemUser } from "@/types";
import { ServiceError } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { userFormSchema, type UserFormValues } from "@/lib/validation/user";
import { useLanguage } from "@/lib/i18n/context";
import { ROLE_LABEL } from "@/lib/permissions/matrix";
import { userService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

function toFormValues(u: SystemUser): UserFormValues {
  return {
    nameBn: u.name.bn,
    nameEn: u.name.en,
    email: u.email,
    role: u.role,
    departmentId: u.departmentId ?? null,
    active: u.active,
  };
}

const EMPTY: UserFormValues = { nameBn: "", nameEn: "", email: "", role: "teacher", departmentId: null, active: true };

export function UserFormDialog({
  user: existingUser,
  departments,
  onSaved,
}: {
  user?: SystemUser;
  departments: Department[];
  onSaved: () => void;
}) {
  const { t, locale } = useLanguage();
  const { user: actor } = useSession();
  const [open, setOpen] = useState(false);
  const isEdit = !!existingUser;

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: existingUser ? toFormValues(existingUser) : EMPTY,
  });

  useEffect(() => {
    if (open) reset(existingUser ? toFormValues(existingUser) : EMPTY);
  }, [open, existingUser, reset]);

  const onSubmit = async (values: UserFormValues) => {
    if (!actor) return;
    try {
      if (isEdit && existingUser) {
        await userService.update(existingUser.id, values, actor.id);
      } else {
        await userService.create(values, actor.id);
      }
      toast.success(t("feedback.saved"));
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ServiceError ? err.message : t("feedback.saveFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon-sm"><Pencil className="size-3.5" /></Button>
        ) : (
          <Button size="sm" className="gap-1.5"><Plus className="size-4" />{t("action.addNew")}</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? (locale === "bn" ? "ইউজার সম্পাদনা" : "Edit user") : (locale === "bn" ? "নতুন ইউজার" : "New user")}</DialogTitle>
          <DialogDescription>{locale === "bn" ? "এটি একটি সিমুলেটেড অ্যাকাউন্ট — কোনো প্রকৃত পাসওয়ার্ড নেই।" : "This is a simulated account — there is no real password."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2">
          <FormField label={locale === "bn" ? "নাম (বাংলা)" : "Name (Bangla)"} error={errors.nameBn}><Input {...register("nameBn")} /></FormField>
          <FormField label={locale === "bn" ? "নাম (ইংরেজি)" : "Name (English)"} error={errors.nameEn}><Input {...register("nameEn")} /></FormField>
          <FormField label={locale === "bn" ? "ইমেইল" : "Email"} error={errors.email}><Input {...register("email")} /></FormField>
          <FormField label={locale === "bn" ? "রোল" : "Role"} error={errors.role}>
            <Controller control={control} name="role" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["principal", "academic_incharge", "hod", "teacher", "student"] as const).map((r) => (
                    <SelectItem key={r} value={r}>{locale === "bn" ? ROLE_LABEL[r].bn : ROLE_LABEL[r].en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <FormField label={t("common.department")} optional>
            <Controller control={control} name="departmentId" render={({ field }) => (
              <Select value={field.value ?? "none"} onValueChange={(v) => field.onChange(v === "none" ? null : v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{locale === "bn" ? "প্রযোজ্য নয়" : "Not applicable"}</SelectItem>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{locale === "bn" ? d.name.bn : d.name.en}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </FormField>
          <div className="flex items-center gap-2 pt-6">
            <Controller control={control} name="active" render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} id="active-switch" />
            )} />
            <label htmlFor="active-switch" className="text-sm text-foreground">{t("status.active")}</label>
          </div>
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
