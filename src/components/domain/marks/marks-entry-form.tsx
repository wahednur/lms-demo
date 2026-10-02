"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import type { CourseAssignment, Examination, MarkEntry, Student, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { attendanceService, examService } from "@/services";
import { useSession } from "@/components/shared/session-provider";

interface Row {
  student: Student;
  entry: MarkEntry | null;
  tc: number | null;
  pc: number | null;
  tf: number | null;
  pf: number | null;
}

export function MarksEntryForm({
  assignments,
  subjectById,
  examinations,
}: {
  assignments: CourseAssignment[];
  subjectById: Map<string, Subject>;
  examinations: Examination[];
}) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [assignmentId, setAssignmentId] = useState(assignments[0]?.id ?? "");
  const assignment = assignments.find((a) => a.id === assignmentId) ?? null;
  const subject = assignment ? subjectById.get(assignment.subjectId) : undefined;

  const matchingExams = useMemo(
    () => (assignment ? examinations.filter((e) => e.subjectIds.includes(assignment.subjectId)) : []),
    [assignment, examinations],
  );
  const [examId, setExamId] = useState(matchingExams[0]?.id ?? "");
  // "Adjusting state when a prop changes" (react.dev) — reset examId during
  // render, not in an Effect, whenever the selected class changes the
  // candidate exam list.
  const [examsForReset, setExamsForReset] = useState(matchingExams);
  if (examsForReset !== matchingExams) {
    setExamsForReset(matchingExams);
    setExamId(matchingExams[0]?.id ?? "");
  }
  const exam = matchingExams.find((e) => e.id === examId) ?? null;

  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<"draft" | "submit" | null>(null);

  useEffect(() => {
    if (!assignment || !exam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale rows when the selection no longer resolves to a fetchable class
      setRows(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      attendanceService.getRoster({
        departmentId: assignment.departmentId,
        semester: assignment.semester,
        shift: assignment.shift,
        session: assignment.session,
      }),
      examService.listMarks({ examId: exam.id, subjectId: assignment.subjectId }),
    ]).then(([roster, marks]) => {
      if (cancelled) return;
      setRows(
        roster.map((s) => {
          const entry = marks.find((m) => m.studentId === s.id) ?? null;
          return { student: s, entry, tc: entry?.tc ?? null, pc: entry?.pc ?? null, tf: entry?.tf ?? null, pf: entry?.pf ?? null };
        }),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [assignment, exam]);

  if (assignments.length === 0) {
    return (
      <EmptyState
        title={locale === "bn" ? "কোনো ক্লাস বরাদ্দ নেই" : "No assigned classes"}
        description={locale === "bn" ? "আপনার নামে কোনো কোর্স বরাদ্দ নেই।" : "You have no course assignments yet."}
      />
    );
  }

  const updateField = (studentId: string, field: "tc" | "pc" | "tf" | "pf", raw: string, max: number) => {
    setRows((prev) =>
      (prev ?? []).map((r) => {
        if (r.student.id !== studentId) return r;
        if (raw === "") return { ...r, [field]: null };
        const num = Number(raw);
        if (Number.isNaN(num)) return r;
        const clamped = Math.max(0, Math.min(max, num));
        return { ...r, [field]: clamped };
      }),
    );
  };

  const editableRows = (rows ?? []).filter((r) => !r.entry || r.entry.status === "draft");
  const lockedCount = (rows ?? []).length - editableRows.length;
  const allFilled =
    editableRows.length > 0 &&
    editableRows.every((r) => {
      if (!subject) return false;
      const needsTheory = subject.maxMarks.tc > 0 || subject.maxMarks.tf > 0;
      const needsPractical = subject.maxMarks.pc > 0 || subject.maxMarks.pf > 0;
      const theoryOk = !needsTheory || (r.tc !== null && r.tf !== null);
      const practicalOk = !needsPractical || (r.pc !== null && r.pf !== null);
      return theoryOk && practicalOk;
    });

  const handleSaveDraft = async () => {
    if (!exam || !assignment || !user || editableRows.length === 0) return;
    setSaving("draft");
    try {
      const saved = await examService.saveDraftMarks(
        editableRows.map((r) => ({ examId: exam.id, subjectId: assignment.subjectId, studentId: r.student.id, tc: r.tc, pc: r.pc, tf: r.tf, pf: r.pf })),
        user.id,
      );
      setRows((prev) =>
        (prev ?? []).map((r) => {
          const match = saved.find((m) => m.studentId === r.student.id);
          return match ? { ...r, entry: match } : r;
        }),
      );
      toast.success(t("feedback.saved"));
    } catch {
      toast.error(t("feedback.saveFailed"));
    } finally {
      setSaving(null);
    }
  };

  const handleSubmit = async () => {
    if (!rows || !user) return;
    const draftIds = rows.filter((r) => r.entry && r.entry.status === "draft").map((r) => r.entry!.id);
    if (draftIds.length === 0) {
      toast.error(locale === "bn" ? "প্রথমে খসড়া সংরক্ষণ করুন" : "Save as draft first");
      return;
    }
    setSaving("submit");
    try {
      const updated = await examService.submitForVerification(draftIds, user.id);
      setRows((prev) =>
        (prev ?? []).map((r) => {
          const match = updated.find((m) => m.studentId === r.student.id);
          return match ? { ...r, entry: match } : r;
        }),
      );
      toast.success(t("feedback.submitted"));
    } catch {
      toast.error(t("feedback.saveFailed"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5">{locale === "bn" ? "ক্লাস নির্বাচন করুন" : "Select class"}</Label>
          <Select value={assignmentId} onValueChange={setAssignmentId}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {assignments.map((a) => {
                const subj = subjectById.get(a.subjectId);
                return (
                  <SelectItem key={a.id} value={a.id}>
                    {subj ? bilingual(subj.name) : a.subjectId} · {locale === "bn" ? "সেমি" : "Sem"} {a.semester} · {a.shift}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5">{locale === "bn" ? "পরীক্ষা" : "Examination"}</Label>
          <Select value={examId} onValueChange={setExamId} disabled={matchingExams.length === 0}>
            <SelectTrigger className="w-full"><SelectValue placeholder={locale === "bn" ? "কোনো পরীক্ষা নেই" : "No examination"} /></SelectTrigger>
            <SelectContent>
              {matchingExams.map((e) => (
                <SelectItem key={e.id} value={e.id}>{bilingual(e.name)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!exam ? (
        <EmptyState title={locale === "bn" ? "এই বিষয়ে কোনো পরীক্ষা সেটআপ করা হয়নি" : "No examination set up for this subject yet"} description={locale === "bn" ? "অ্যাডমিন প্যানেলে পরীক্ষা তৈরি হলে এখানে দেখা যাবে।" : "Once an administrator creates an examination, it will appear here."} />
      ) : loading || !rows ? (
        <PageLoading label={t("table.loading")} />
      ) : rows.length === 0 ? (
        <EmptyState title={locale === "bn" ? "কোনো শিক্ষার্থী নেই" : "No students in this class"} />
      ) : (
        <>
          {lockedCount > 0 && (
            <Alert className="border-info/30 bg-info-soft text-info">
              <Info className="size-4" />
              <AlertDescription className="text-info/90">
                {locale === "bn"
                  ? `${lockedCount} জন শিক্ষার্থীর নম্বর ইতিমধ্যে জমা/যাচাই/প্রকাশ হয়েছে — সম্পাদনাযোগ্য নয়।`
                  : `${lockedCount} student(s) already submitted/verified/published — no longer editable here.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{locale === "bn" ? "রোল" : "Roll"}</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.student")}</th>
                  {subject && subject.maxMarks.tc > 0 && <th className="px-3 py-2 text-right font-medium text-muted-foreground">TC /{subject.maxMarks.tc}</th>}
                  {subject && subject.maxMarks.pc > 0 && <th className="px-3 py-2 text-right font-medium text-muted-foreground">PC /{subject.maxMarks.pc}</th>}
                  {subject && subject.maxMarks.tf > 0 && <th className="px-3 py-2 text-right font-medium text-muted-foreground">TF /{subject.maxMarks.tf}</th>}
                  {subject && subject.maxMarks.pf > 0 && <th className="px-3 py-2 text-right font-medium text-muted-foreground">PF /{subject.maxMarks.pf}</th>}
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "অবস্থা" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const editable = !r.entry || r.entry.status === "draft";
                  const returnedNote = r.entry?.history.filter((h) => h.status === "returned").at(-1)?.note;
                  return (
                    <tr key={r.student.id} className="border-t border-border align-top even:bg-muted/20">
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{r.student.roll}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {bilingual(r.student.name)}
                        {returnedNote && (
                          <p className="mt-0.5 max-w-[14rem] text-xs text-danger">{returnedNote}</p>
                        )}
                      </td>
                      {subject && subject.maxMarks.tc > 0 && (
                        <td className="px-2 py-2 text-right">
                          <MarkInput value={r.tc} max={subject.maxMarks.tc} disabled={!editable} onChange={(v) => updateField(r.student.id, "tc", v, subject.maxMarks.tc)} />
                        </td>
                      )}
                      {subject && subject.maxMarks.pc > 0 && (
                        <td className="px-2 py-2 text-right">
                          <MarkInput value={r.pc} max={subject.maxMarks.pc} disabled={!editable} onChange={(v) => updateField(r.student.id, "pc", v, subject.maxMarks.pc)} />
                        </td>
                      )}
                      {subject && subject.maxMarks.tf > 0 && (
                        <td className="px-2 py-2 text-right">
                          <MarkInput value={r.tf} max={subject.maxMarks.tf} disabled={!editable} onChange={(v) => updateField(r.student.id, "tf", v, subject.maxMarks.tf)} />
                        </td>
                      )}
                      {subject && subject.maxMarks.pf > 0 && (
                        <td className="px-2 py-2 text-right">
                          <MarkInput value={r.pf} max={subject.maxMarks.pf} disabled={!editable} onChange={(v) => updateField(r.student.id, "pf", v, subject.maxMarks.pf)} />
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-right">
                        <StatusBadge status={r.entry?.status ?? "draft"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {!allFilled
                ? locale === "bn" ? "সব ঘর পূরণ না হলে জমা দেওয়া যাবে না" : "Fill every cell before submitting"
                : locale === "bn" ? "সব ঘর পূরণ হয়েছে" : "All cells filled"}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={saving !== null || editableRows.length === 0} className="gap-1.5">
                {saving === "draft" && <Loader2 className="size-4 animate-spin" />}
                {t("action.saveDraft")}
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={saving !== null || !allFilled} className="gap-1.5">
                {saving === "submit" && <Loader2 className="size-4 animate-spin" />}
                {t("action.submitForVerification")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MarkInput({ value, max, disabled, onChange }: { value: number | null; max: number; disabled: boolean; onChange: (v: string) => void }) {
  return (
    <Input
      type="number"
      min={0}
      max={max}
      inputMode="numeric"
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-16 text-right tabular-nums"
    />
  );
}
