"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { StudentProfileTabs } from "@/components/domain/student/student-profile-tabs";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { useAsync } from "@/hooks/use-async";
import { academicService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

export default function StudentProfilePage() {
  const { data: student, loading } = useCurrentStudent();
  const { data: department } = useAsync(
    () => (student ? academicService.getDepartment(student.departmentId) : Promise.resolve(null)),
    [student?.departmentId],
  );
  const { t } = useLanguage();
  const bilingual = useBilingual();

  if (loading || !student) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.profile")} />
      <div className="flex items-center gap-4 rounded-lg border border-border p-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary/10 text-base text-primary">{student.photoInitials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold text-foreground">{bilingual(student.name)}</p>
          <p className="text-sm text-muted-foreground">
            {department ? bilingual(department.name) : ""} · {t("common.semester")} {student.semester} · {t("common.session")} {student.session}
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-border p-4">
        <StudentProfileTabs student={student} department={department} />
      </div>
    </div>
  );
}
