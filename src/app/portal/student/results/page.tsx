"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { SemesterResultView } from "@/components/domain/exam/semester-result-view";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { useAsync } from "@/hooks/use-async";
import { examService, academicService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";
import { GraduationCap } from "lucide-react";

export default function StudentResultsPage() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { t, locale } = useLanguage();

  const { data, loading } = useAsync(async () => {
    if (!student) return null;
    const [history, subjects] = await Promise.all([
      examService.getStudentResultHistory(student.id),
      academicService.listSubjects({ departmentId: student.departmentId }),
    ]);
    return { history, subjectById: new Map(subjects.map((s) => [s.id, s])) };
  }, [student?.id]);

  if (studentLoading || loading || !student || !data) return <PageLoading label={t("table.loading")} />;

  if (data.history.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t("nav.results")} />
        <EmptyState
          icon={GraduationCap}
          title={t("empty.notPublished")}
          description={locale === "bn" ? "আপনার বিভাগীয় প্রধান ও অধ্যক্ষের চূড়ান্ত অনুমোদনের পর ফলাফল এখানে প্রদর্শিত হবে।" : "Results will appear here once your department head and the principal complete final approval."}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.results")} />
      <Tabs defaultValue={String(data.history[data.history.length - 1].semester)}>
        <TabsList className="flex-wrap">
          {data.history.map((r) => (
            <TabsTrigger key={r.semester} value={String(r.semester)}>
              {locale === "bn" ? "সেমিস্টার" : "Sem"} {r.semester}
            </TabsTrigger>
          ))}
        </TabsList>
        {data.history.map((r) => (
          <TabsContent key={r.semester} value={String(r.semester)} className="pt-4">
            <SemesterResultView result={r} subjectById={data.subjectById} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
