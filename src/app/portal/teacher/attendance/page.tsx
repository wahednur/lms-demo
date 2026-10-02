"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { AttendanceEntryForm } from "@/components/domain/attendance/attendance-entry-form";
import { useCurrentStaff } from "@/hooks/use-current-staff";
import { useAsync } from "@/hooks/use-async";
import { academicService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";

export default function TeacherAttendancePage() {
  const { data: staff, loading: staffLoading } = useCurrentStaff();
  const { t } = useLanguage();

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
      <PageHeader title={t("nav.attendance")} />
      <div className="rounded-lg border border-border p-4 sm:p-5">
        <AttendanceEntryForm assignments={data.assignments} subjectById={data.subjectById} />
      </div>
    </div>
  );
}
