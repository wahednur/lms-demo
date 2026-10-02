"use client";

import Link from "next/link";
import { Users, GraduationCap, Building2, ClipboardCheck, Send, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PageLoading } from "@/components/shared/loading";
import { EnrollmentChart } from "@/components/domain/reports/enrollment-chart";
import { GradeDistributionChart } from "@/components/domain/reports/grade-distribution-chart";
import { useAsync } from "@/hooks/use-async";
import { academicService, reportService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatPercent } from "@/lib/i18n/format";

export default function AdminOverviewPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  const { data, loading } = useAsync(async () => {
    const [summary, deptSummaries, enrollment, grades, departments] = await Promise.all([
      reportService.instituteSummary(),
      reportService.allDepartmentSummaries(),
      reportService.enrollmentByDepartment(),
      reportService.resultDistribution({}),
      academicService.listDepartments(),
    ]);
    const deptById = new Map(departments.map((d) => [d.id, d]));
    const enrollmentWithDept = enrollment
      .map((e) => ({ department: deptById.get(e.departmentId)!, count: e.count }))
      .filter((e) => e.department);
    return { summary, deptSummaries, enrollmentWithDept, grades, deptById };
  }, []);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.admin.overview")} description={locale === "bn" ? "প্রতিষ্ঠানব্যাপী সার্বিক পরিস্থিতি" : "Institute-wide snapshot"} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={locale === "bn" ? "সক্রিয় শিক্ষার্থী" : "Active students"} value={data.summary.totalStudents} icon={Users} />
        <StatCard label={locale === "bn" ? "শিক্ষক" : "Teachers"} value={data.summary.totalTeachers} icon={GraduationCap} />
        <StatCard label={t("common.department")} value={data.summary.totalDepartments} icon={Building2} />
        <StatCard label={locale === "bn" ? "সক্রিয় ইউজার" : "Active users"} value={data.summary.activeUsers} icon={UserCheck} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="size-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">{locale === "bn" ? "যাচাইয়ের অপেক্ষায়" : "Awaiting verification"}</p>
              <p className="text-xl font-semibold text-warning">{data.summary.pendingMarkVerifications}</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline"><Link href="/admin/examinations">{t("action.view")}</Link></Button>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-info/30 bg-info-soft p-4">
          <div className="flex items-center gap-3">
            <Send className="size-5 text-info" />
            <div>
              <p className="text-sm font-medium text-foreground">{locale === "bn" ? "প্রকাশের অপেক্ষায়" : "Ready to publish"}</p>
              <p className="text-xl font-semibold text-info">{data.summary.pendingPublications}</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline"><Link href="/admin/results">{t("action.view")}</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{locale === "bn" ? "বিভাগভিত্তিক শিক্ষার্থী" : "Students by department"}</h2>
          <EnrollmentChart data={data.enrollmentWithDept} />
        </div>
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{locale === "bn" ? "গ্রেড বিতরণ (প্রকাশিত ফলাফল)" : "Grade distribution (published results)"}</h2>
          <GradeDistributionChart data={data.grades} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.department")}</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "সক্রিয় শিক্ষার্থী" : "Active students"}</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "শিক্ষক" : "Teachers"}</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "উপস্থিতির হার" : "Attendance"}</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "প্রকাশিত ফলাফল" : "Published results"}</th>
            </tr>
          </thead>
          <tbody>
            {data.deptSummaries.map((s) => {
              const dept = data.deptById.get(s.departmentId);
              return (
                <tr key={s.departmentId} className="border-t border-border even:bg-muted/20">
                  <td className="px-3 py-2.5 font-medium text-foreground">{dept ? bilingual(dept.name) : s.departmentId}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.activeStudentCount}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.teacherCount}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.attendancePercent !== null ? formatPercent(s.attendancePercent, locale) : "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{s.publishedResultCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
