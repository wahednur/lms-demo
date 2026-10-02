"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader2, CalendarDays, Users } from "lucide-react";
import type { AttendanceEntry, AttendanceMark, AttendanceRecord, CourseAssignment, Student, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { attendanceService } from "@/services";
import { todayIso } from "@/lib/weekday";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/shared/session-provider";

type LocalMark = AttendanceMark | null;

export function AttendanceEntryForm({
  assignments,
  subjectById,
}: {
  assignments: CourseAssignment[];
  subjectById: Map<string, Subject>;
}) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [assignmentId, setAssignmentId] = useState(assignments[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [roster, setRoster] = useState<Student[] | null>(null);
  const [existing, setExisting] = useState<AttendanceRecord | null>(null);
  const [marks, setMarks] = useState<Record<string, LocalMark>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const assignment = assignments.find((a) => a.id === assignmentId) ?? null;
  const subject = assignment ? subjectById.get(assignment.subjectId) : undefined;

  useEffect(() => {
    if (!assignment) return;
    let cancelled = false;
    // Refetching roster + existing record whenever the selected class/date
    // changes is the reason for this Effect; see react.dev "Fetching data".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      attendanceService.getRoster({
        departmentId: assignment.departmentId,
        semester: assignment.semester,
        shift: assignment.shift,
        session: assignment.session,
      }),
      attendanceService.getRecord({ subjectId: assignment.subjectId, date }),
    ]).then(([rosterRes, recordRes]) => {
      if (cancelled) return;
      setRoster(rosterRes);
      setExisting(recordRes);
      const initial: Record<string, LocalMark> = {};
      rosterRes.forEach((s) => {
        const entry = recordRes?.entries.find((e) => e.studentId === s.id);
        initial[s.id] = entry?.status ?? null;
      });
      setMarks(initial);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- assignment is derived from assignmentId, included via assignment?.id
  }, [assignment?.id, date]);

  const markAllPresent = () => {
    if (!roster) return;
    const next: Record<string, LocalMark> = {};
    roster.forEach((s) => (next[s.id] = "present"));
    setMarks(next);
  };

  const setMark = (studentId: string, status: AttendanceMark) => {
    setMarks((prev) => ({ ...prev, [studentId]: prev[studentId] === status ? null : status }));
  };

  const unmarkedCount = roster?.filter((s) => !marks[s.id]).length ?? 0;
  const canSave = !!roster && roster.length > 0 && unmarkedCount === 0 && !saving;

  const handleSave = async () => {
    if (!assignment || !roster || !user) return;
    setSaving(true);
    try {
      const entries: AttendanceEntry[] = roster.map((s) => ({ studentId: s.id, status: marks[s.id] as AttendanceMark }));
      const saved = await attendanceService.saveRecord(
        {
          date,
          subjectId: assignment.subjectId,
          departmentId: assignment.departmentId,
          semester: assignment.semester,
          shift: assignment.shift,
          session: assignment.session,
          teacherId: assignment.teacherId,
          entries,
        },
        user.id,
      );
      setExisting(saved);
      toast.success(t("feedback.saved"));
    } catch {
      toast.error(t("feedback.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (assignments.length === 0) {
    return (
      <EmptyState
        title={locale === "bn" ? "কোনো ক্লাস বরাদ্দ নেই" : "No assigned classes"}
        description={locale === "bn" ? "আপনার নামে কোনো কোর্স বরাদ্দ নেই।" : "You have no course assignments yet."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="assignment" className="mb-1.5">{locale === "bn" ? "ক্লাস নির্বাচন করুন" : "Select class"}</Label>
          <Select value={assignmentId} onValueChange={setAssignmentId}>
            <SelectTrigger id="assignment" className="w-full"><SelectValue /></SelectTrigger>
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
          <Label htmlFor="date" className="mb-1.5">{t("common.date")}</Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="date"
              type="date"
              value={date}
              max={todayIso()}
              onChange={(e) => setDate(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoading label={t("table.loading")} />
      ) : !roster || roster.length === 0 ? (
        <EmptyState icon={Users} title={locale === "bn" ? "কোনো শিক্ষার্থী পাওয়া যায়নি" : "No students in this class"} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="text-sm">
              {subject && <span className="font-medium text-foreground">{bilingual(subject.name)}</span>}
              <span className="ml-2 text-muted-foreground">
                {existing
                  ? locale === "bn" ? "ইতিমধ্যে রেকর্ড করা — সম্পাদনাযোগ্য" : "Already recorded — editable"
                  : locale === "bn" ? "এখনো রেকর্ড করা হয়নি" : "Not yet recorded"}
              </span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={markAllPresent}>
              {t("action.markAllPresent")}
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{locale === "bn" ? "রোল" : "Roll"}</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.student")}</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "উপস্থিতি" : "Attendance"}</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => {
                  const mark = marks[s.id];
                  return (
                    <tr key={s.id} className="border-t border-border even:bg-muted/20">
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{s.roll}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{bilingual(s.name)}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMark(s.id, "present")}
                            aria-pressed={mark === "present"}
                            className={cn(
                              "flex size-8 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              mark === "present"
                                ? "border-success bg-success-soft text-success"
                                : "border-border text-muted-foreground hover:bg-accent",
                            )}
                            aria-label={`${t("status.present")} — ${bilingual(s.name)}`}
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setMark(s.id, "absent")}
                            aria-pressed={mark === "absent"}
                            className={cn(
                              "flex size-8 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              mark === "absent"
                                ? "border-danger bg-danger-soft text-danger"
                                : "border-border text-muted-foreground hover:bg-accent",
                            )}
                            aria-label={`${t("status.absent")} — ${bilingual(s.name)}`}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {unmarkedCount > 0
                ? locale === "bn"
                  ? `${unmarkedCount} জন শিক্ষার্থী এখনো চিহ্নিত হয়নি`
                  : `${unmarkedCount} student(s) not yet marked`
                : locale === "bn"
                  ? "সকল শিক্ষার্থী চিহ্নিত হয়েছে"
                  : "All students marked"}
            </p>
            <Button onClick={handleSave} disabled={!canSave} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {t("action.save")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
