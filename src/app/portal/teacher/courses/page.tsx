"use client";

import Link from "next/link";
import { CalendarCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { useCurrentStaff } from "@/hooks/use-current-staff";
import { useAsync } from "@/hooks/use-async";
import { academicService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

export default function TeacherCoursesPage() {
  const { data: staff, loading: staffLoading } = useCurrentStaff();
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  const { data, loading } = useAsync(async () => {
    if (!staff) return null;
    const [assignments, subjects] = await Promise.all([
      academicService.listCourseAssignments({ teacherId: staff.id }),
      academicService.listSubjects(),
    ]);
    return { assignments, subjectById: new Map(subjects.map((s) => [s.id, s])) };
  }, [staff?.id]);

  if (staffLoading || loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.courses")} />
      {data.assignments.length === 0 ? (
        <EmptyState title={locale === "bn" ? "কোনো কোর্স বরাদ্দ নেই" : "No courses assigned"} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.assignments.map((a) => {
            const subject = data.subjectById.get(a.subjectId);
            return (
              <div key={a.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <div>
                  <Badge variant="secondary" className="mb-2 font-mono text-[11px]">{subject?.code}</Badge>
                  <p className="font-semibold text-foreground">{subject ? bilingual(subject.name) : a.subjectId}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "bn" ? "সেমিস্টার" : "Semester"} {a.semester} · {a.shift} · {a.session}
                  </p>
                </div>
                <div className="mt-auto flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Link href="/portal/teacher/attendance"><CalendarCheck className="size-3.5" />{t("nav.attendance")}</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                    <Link href="/portal/teacher/marks"><ClipboardList className="size-3.5" />{t("nav.marks")}</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
