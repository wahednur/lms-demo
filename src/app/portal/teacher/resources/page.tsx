"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { ResourceList } from "@/components/domain/resources/resource-list";
import { AddResourceDialog } from "@/components/domain/resources/add-resource-dialog";
import { useCurrentStaff } from "@/hooks/use-current-staff";
import { useAsync } from "@/hooks/use-async";
import { academicService, resourceService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";

export default function TeacherResourcesPage() {
  const { data: staff, loading: staffLoading } = useCurrentStaff();
  const { t } = useLanguage();

  const { data, loading, reload } = useAsync(async () => {
    if (!staff) return null;
    const [assignments, subjects, resources] = await Promise.all([
      academicService.listCourseAssignments({ teacherId: staff.id }),
      academicService.listSubjects(),
      resourceService.list({ teacherId: staff.id }),
    ]);
    return { assignments, subjectById: new Map(subjects.map((s) => [s.id, s])), resources };
  }, [staff?.id]);

  if (staffLoading || loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("nav.resources")}
        actions={<AddResourceDialog assignments={data.assignments} subjectById={data.subjectById} onCreated={reload} />}
      />
      <ResourceList resources={data.resources} subjectById={data.subjectById} />
    </div>
  );
}
