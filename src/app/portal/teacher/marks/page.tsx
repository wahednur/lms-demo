"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { MarksEntryForm } from "@/components/domain/marks/marks-entry-form";
import { useCurrentStaff } from "@/hooks/use-current-staff";
import { useAsync } from "@/hooks/use-async";
import { academicService, examService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";

export default function TeacherMarksPage() {
  const { data: staff, loading: staffLoading } = useCurrentStaff();
  const { t } = useLanguage();

  const { data, loading } = useAsync(async () => {
    if (!staff) return null;
    const [assignments, subjects, examinations] = await Promise.all([
      academicService.listCourseAssignments({ teacherId: staff.id }),
      academicService.listSubjects(),
      examService.listExaminations(),
    ]);
    return { assignments, subjectById: new Map(subjects.map((s) => [s.id, s])), examinations };
  }, [staff?.id]);

  if (staffLoading || loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.marks")} />
      <div className="rounded-lg border border-border p-4 sm:p-5">
        <MarksEntryForm assignments={data.assignments} subjectById={data.subjectById} examinations={data.examinations} />
      </div>
    </div>
  );
}
