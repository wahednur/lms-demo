"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpCircle, Loader2 } from "lucide-react";
import type { SemesterNumber, Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormField } from "@/components/shared/form-field";
import { useLanguage } from "@/lib/i18n/context";
import { studentService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

export function PromoteStudentDialog({ student, onPromoted }: { student: Student; onPromoted: () => void }) {
  const { t, locale } = useLanguage();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(student.session);
  const [loading, setLoading] = useState(false);

  const nextSemester = Math.min(8, student.semester + 1) as SemesterNumber;
  const atFinalSemester = student.semester >= 8;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await studentService.promote(student.id, nextSemester, session, user.id);
      toast.success(locale === "bn" ? `সেমিস্টার ${nextSemester}-এ উত্তীর্ণ করা হয়েছে।` : `Promoted to semester ${nextSemester}.`);
      setOpen(false);
      onPromoted();
    } catch {
      toast.error(t("feedback.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (atFinalSemester || student.status !== "active") return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ArrowUpCircle className="size-3.5" />
          {t("action.promote")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("action.promote")}</AlertDialogTitle>
          <AlertDialogDescription>
            {locale === "bn"
              ? `${student.name.bn}-কে সেমিস্টার ${student.semester} থেকে সেমিস্টার ${nextSemester}-এ উত্তীর্ণ করবেন?`
              : `Promote ${student.name.en} from semester ${student.semester} to semester ${nextSemester}?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="px-1">
          <FormField label={t("common.session")}>
            <Input value={session} onChange={(e) => setSession(e.target.value)} />
          </FormField>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("action.cancel")}</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={loading} className="gap-1.5">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {t("action.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
