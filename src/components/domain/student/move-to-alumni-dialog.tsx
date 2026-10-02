"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import type { Student } from "@/types";
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

export function MoveToAlumniDialog({ student, onMoved }: { student: Student; onMoved: () => void }) {
  const { t, locale } = useLanguage();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [passedYear, setPassedYear] = useState(String(new Date().getFullYear()));
  const [finalCgpa, setFinalCgpa] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await studentService.moveToAlumni(
        student.id,
        { passedYear: Number(passedYear), finalCgpa: finalCgpa ? Number(finalCgpa) : null },
        user.id,
      );
      toast.success(locale === "bn" ? "অ্যালামনাইতে স্থানান্তরিত হয়েছে।" : "Moved to alumni.");
      setOpen(false);
      onMoved();
    } catch {
      toast.error(t("feedback.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (student.status !== "active") return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <GraduationCap className="size-3.5" />
          {t("action.moveToAlumni")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("action.moveToAlumni")}</AlertDialogTitle>
          <AlertDialogDescription>
            {locale === "bn"
              ? `${student.name.bn}-কে স্থায়ীভাবে অ্যালামনাই হিসেবে চিহ্নিত করা হবে। এটি পূর্বাবস্থায় ফেরানো সহজ নয়।`
              : `${student.name.en} will be permanently marked as alumni. This is not easily reversible.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-3 px-1 sm:grid-cols-2">
          <FormField label={locale === "bn" ? "পাসের বছর" : "Passed Year"}>
            <Input type="number" value={passedYear} onChange={(e) => setPassedYear(e.target.value)} />
          </FormField>
          <FormField label="CGPA" optional>
            <Input type="number" step="0.01" min={0} max={4} value={finalCgpa} onChange={(e) => setFinalCgpa(e.target.value)} />
          </FormField>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("action.cancel")}</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading} className="gap-1.5">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {t("action.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
