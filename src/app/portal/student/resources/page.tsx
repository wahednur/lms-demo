"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { ResourceList } from "@/components/domain/resources/resource-list";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { useAsync } from "@/hooks/use-async";
import { academicService, resourceService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";

export default function StudentResourcesPage() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { t } = useLanguage();

  const { data, loading } = useAsync(async () => {
    if (!student) return null;
    const subjects = await academicService.listSubjects({ departmentId: student.departmentId, semester: student.semester });
    const subjectIds = subjects.map((s) => s.id);
    const resources = (await resourceService.list()).filter((r) => subjectIds.includes(r.subjectId));
    return { resources, subjectById: new Map(subjects.map((s) => [s.id, s])) };
  }, [student?.id]);

  if (studentLoading || loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.resources")} />
      <ResourceList resources={data.resources} subjectById={data.subjectById} />
    </div>
  );
}
