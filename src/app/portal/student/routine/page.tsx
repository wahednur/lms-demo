"use client";

import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { PrintButton } from "@/components/shared/print-button";
import { RoutineGrid } from "@/components/domain/routine/routine-grid";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { useAsync } from "@/hooks/use-async";
import { academicService, routineService, staffService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";

export default function StudentRoutinePage() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { t } = useLanguage();

  const { data, loading } = useAsync(async () => {
    if (!student) return null;
    const [slots, subjects] = await Promise.all([
      routineService.listSlots({
        departmentId: student.departmentId,
        semester: student.semester,
        shift: student.shift,
        session: student.session,
      }),
      academicService.listSubjects({ departmentId: student.departmentId, semester: student.semester }),
    ]);
    const teacherIds = Array.from(new Set(slots.map((s) => s.teacherId)));
    const teachers = await Promise.all(teacherIds.map((id) => staffService.getById(id)));
    return {
      slots,
      subjectById: new Map(subjects.map((s) => [s.id, s])),
      teacherById: new Map(teachers.filter((t) => t).map((t) => [t!.id, t!])),
    };
  }, [student?.id]);

  if (studentLoading || loading || !student || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.routine")} actions={<PrintButton />} />
      <RoutineGrid slots={data.slots} subjectById={data.subjectById} teacherById={data.teacherById} />
    </div>
  );
}
