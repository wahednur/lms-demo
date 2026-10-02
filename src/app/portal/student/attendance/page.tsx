"use client";

import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { useAsync } from "@/hooks/use-async";
import { academicService, attendanceService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";

export default function StudentAttendancePage() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  const { data, loading } = useAsync(async () => {
    if (!student) return null;
    const [summary, records, subjects] = await Promise.all([
      attendanceService.getStudentSummary(student.id, student.session),
      attendanceService.listRecords({
        departmentId: student.departmentId,
        semester: student.semester,
        shift: student.shift,
      }),
      academicService.listSubjects({ departmentId: student.departmentId, semester: student.semester }),
    ]);
    const subjectById = new Map(subjects.map((s) => [s.id, s]));
    const myRecords = records
      .map((r) => ({
        date: r.date,
        subject: subjectById.get(r.subjectId),
        status: r.entries.find((e) => e.studentId === student.id)?.status,
      }))
      .filter((r) => r.status)
      .sort((a, b) => b.date.localeCompare(a.date));
    return { summary, myRecords, subjects: subjectById };
  }, [student?.id]);

  if (studentLoading || loading || !student || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.attendance")} />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label={locale === "bn" ? "উপস্থিতির হার" : "Attendance rate"} value={`${data.summary.percent}%`} icon={CalendarCheck} tone={data.summary.percent < 75 ? "danger" : "success"} />
        <StatCard label={t("status.present")} value={data.summary.present} icon={CheckCircle2} tone="success" />
        <StatCard label={t("status.absent")} value={data.summary.absent} icon={XCircle} tone="danger" />
        <StatCard label={locale === "bn" ? "মোট ক্লাস" : "Total classes"} value={data.summary.totalClasses} />
      </div>

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{locale === "bn" ? "বিষয়ভিত্তিক উপস্থিতি" : "Attendance by subject"}</h2>
        </div>
        <div className="p-4">
          {data.summary.bySubject.length === 0 ? (
            <EmptyState title={t("empty.noAttendance")} />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {data.summary.bySubject.map((s) => {
                const subject = data.subjects.get(s.subjectId);
                return (
                  <div key={s.subjectId} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm">
                    <span className="truncate text-foreground">{subject ? bilingual(subject.name) : s.subjectId}</span>
                    <span className={s.percent < 75 ? "font-medium text-danger" : "font-medium text-success"}>{s.percent}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{locale === "bn" ? "বিস্তারিত রেকর্ড" : "Detailed records"}</h2>
        </div>
        <div className="max-h-[28rem] overflow-y-auto p-4">
          {data.myRecords.length === 0 ? (
            <EmptyState title={t("empty.noAttendance")} />
          ) : (
            <ul className="space-y-1.5">
              {data.myRecords.map((r, i) => (
                <li key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span className="text-foreground">{r.subject ? bilingual(r.subject.name) : "—"}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.date, locale)}</span>
                  <StatusBadge status={r.status === "present" ? "present" : "absent"} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
