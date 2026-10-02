"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { PrintButton } from "@/components/shared/print-button";
import { RoutineGrid } from "@/components/domain/routine/routine-grid";
import { useCurrentStaff } from "@/hooks/use-current-staff";
import { useAsync } from "@/hooks/use-async";
import { academicService, routineService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";

export default function TeacherRoutinePage() {
  const { data: staff, loading: staffLoading } = useCurrentStaff();
  const { t } = useLanguage();

  const { data, loading } = useAsync(async () => {
    if (!staff) return null;
    const [slots, subjects] = await Promise.all([
      routineService.getTeacherRoutine(staff.id),
      academicService.listSubjects(),
    ]);
    return { slots, subjectById: new Map(subjects.map((s) => [s.id, s])) };
  }, [staff?.id]);

  if (staffLoading || loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.routine")} actions={<PrintButton />} />
      <RoutineGrid slots={data.slots} subjectById={data.subjectById} showClassLabel />
    </div>
  );
}
