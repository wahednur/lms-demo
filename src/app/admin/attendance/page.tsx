"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { AttendanceTrendChart } from "@/components/domain/reports/attendance-trend-chart";
import { useAsync } from "@/hooks/use-async";
import { academicService, attendanceService, reportService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";
import { todayIso } from "@/lib/weekday";

const ALL = "all";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminAttendancePage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const [departmentId, setDepartmentId] = useState(ALL);

  const { data: departments } = useAsync(() => academicService.listDepartments(), []);

  const { data, loading } = useAsync(async () => {
    const filterDept = departmentId !== ALL ? departmentId : undefined;
    const fromDate = daysAgoIso(30);
    const toDate = todayIso();
    const [trend, records, missing, subjects] = await Promise.all([
      reportService.attendanceTrend({ departmentId: filterDept, dateFrom: fromDate, dateTo: toDate }),
      attendanceService.listRecords({ departmentId: filterDept, dateFrom: daysAgoIso(14), dateTo: toDate }),
      attendanceService.getMissingEntries({ departmentId: filterDept, fromDate: daysAgoIso(7), toDate }),
      academicService.listSubjects(),
    ]);
    return { trend, records, missing, subjectById: new Map(subjects.map((s) => [s.id, s])) };
  }, [departmentId]);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.admin.attendance")} />

      <Select value={departmentId} onValueChange={setDepartmentId}>
        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("common.all")} {t("common.department")}</SelectItem>
          {(departments ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {locale === "bn" ? "গত ৩০ দিনের উপস্থিতির প্রবণতা" : "Attendance trend — last 30 days"}
        </h2>
        <AttendanceTrendChart data={data.trend} />
      </div>

      <div className="rounded-lg border border-warning/30 bg-warning-soft">
        <div className="flex items-center gap-2 border-b border-warning/30 px-4 py-3">
          <AlertTriangle className="size-4 text-warning" />
          <h2 className="text-sm font-semibold text-foreground">
            {locale === "bn" ? "এন্ট্রি বাকি (গত ৭ দিন)" : "Missing entries (last 7 days)"}
          </h2>
          <span className="ml-auto rounded-full bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">
            {data.missing.length}
          </span>
        </div>
        <div className="max-h-72 overflow-y-auto p-4">
          {data.missing.length === 0 ? (
            <p className="text-sm text-muted-foreground">{locale === "bn" ? "কোনো এন্ট্রি বাকি নেই।" : "No missing entries."}</p>
          ) : (
            <ul className="space-y-1.5">
              {data.missing.map((m, i) => {
                const subject = data.subjectById.get(m.subjectId);
                return (
                  <li key={i} className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm">
                    <span className="text-foreground">{subject ? bilingual(subject.name) : m.subjectId}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(m.date, locale)} · {locale === "bn" ? "সেমি" : "Sem"} {m.semester} · {m.shift}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{locale === "bn" ? "সাম্প্রতিক রেকর্ড (১৪ দিন)" : "Recent records (14 days)"}</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {data.records.length === 0 ? (
            <div className="p-4"><EmptyState title={t("empty.noAttendance")} /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.date")}</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.subject")}</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "সেমি/শিফট" : "Sem/Shift"}</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "উপস্থিত/মোট" : "Present/Total"}</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => {
                  const subject = data.subjectById.get(r.subjectId);
                  const present = r.entries.filter((e) => e.status === "present").length;
                  return (
                    <tr key={r.id} className="border-t border-border even:bg-muted/20">
                      <td className="px-3 py-2">{formatDate(r.date, locale)}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{subject ? bilingual(subject.name) : r.subjectId}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{r.semester} / {r.shift}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{present}/{r.entries.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
