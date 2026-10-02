"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Undo2, Loader2 } from "lucide-react";
import type { MarkEntry, Student, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { examService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

export function VerificationQueue({
  marks,
  studentById,
  subjectById,
  onChanged,
}: {
  marks: MarkEntry[];
  studentById: Map<string, Student>;
  subjectById: Map<string, Subject>;
  onChanged: () => void;
}) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<"verify" | "return" | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (marks.length === 0) {
    return <EmptyState title={locale === "bn" ? "যাচাইয়ের জন্য কিছু নেই" : "Nothing awaiting verification"} />;
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected((prev) => (prev.size === marks.length ? new Set() : new Set(marks.map((m) => m.id))));
  };

  const handleVerify = async () => {
    if (!user || selected.size === 0) return;
    setBusy("verify");
    try {
      await examService.verifyMarks(Array.from(selected), user.id);
      toast.success(locale === "bn" ? "যাচাই সম্পন্ন হয়েছে।" : "Verified successfully.");
      setSelected(new Set());
      onChanged();
    } catch {
      toast.error(t("feedback.saveFailed"));
    } finally {
      setBusy(null);
    }
  };

  const handleReturn = async () => {
    if (!user || selected.size === 0 || reason.trim().length < 10) return;
    setBusy("return");
    try {
      await examService.returnForCorrection(Array.from(selected), reason.trim(), user.id);
      toast.success(locale === "bn" ? "সংশোধনের জন্য ফেরত পাঠানো হয়েছে।" : "Returned for correction.");
      setSelected(new Set());
      setReason("");
      setReturnOpen(false);
      onChanged();
    } catch {
      toast.error(t("feedback.saveFailed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selected.size > 0
            ? locale === "bn" ? `${selected.size} টি নির্বাচিত` : `${selected.size} selected`
            : locale === "bn" ? "যাচাই করতে নির্বাচন করুন" : "Select entries to act on"}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={selected.size === 0 || busy !== null} onClick={() => setReturnOpen(true)} className="gap-1.5">
            <Undo2 className="size-3.5" />
            {t("action.returnForCorrection")}
          </Button>
          <Button size="sm" disabled={selected.size === 0 || busy !== null} onClick={handleVerify} className="gap-1.5">
            {busy === "verify" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            {t("action.verifyApprove")}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="w-10 px-3 py-2"><Checkbox checked={selected.size === marks.length} onCheckedChange={toggleAll} /></th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.student")}</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.subject")}</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">TC</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">PC</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">TF</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">PF</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m) => {
              const student = studentById.get(m.studentId);
              const subject = subjectById.get(m.subjectId);
              return (
                <tr key={m.id} className="border-t border-border even:bg-muted/20">
                  <td className="px-3 py-2"><Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggle(m.id)} /></td>
                  <td className="px-3 py-2 font-medium text-foreground">{student ? bilingual(student.name) : m.studentId}</td>
                  <td className="px-3 py-2 text-muted-foreground">{subject ? bilingual(subject.name) : m.subjectId}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.tc ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.pc ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.tf ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{m.pf ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("action.returnForCorrection")}</DialogTitle>
            <DialogDescription>
              {locale === "bn" ? "একটি কারণ উল্লেখ করুন যাতে শিক্ষক বুঝতে পারেন কী সংশোধন করতে হবে।" : "Explain what needs correcting so the teacher knows what to fix."}
            </DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder={locale === "bn" ? "যেমন: প্র্যাকটিক্যাল নম্বর পুনরায় যাচাই করুন" : "e.g. Please recheck the practical marks"} />
          {reason.trim().length > 0 && reason.trim().length < 10 && (
            <p className="text-xs text-danger">{locale === "bn" ? "অন্তত ১০ অক্ষর লিখুন" : "Please write at least 10 characters"}</p>
          )}
          <DialogFooter>
            <Button variant="destructive" disabled={reason.trim().length < 10 || busy !== null} onClick={handleReturn} className="gap-1.5">
              {busy === "return" && <Loader2 className="size-4 animate-spin" />}
              {t("action.returnForCorrection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
