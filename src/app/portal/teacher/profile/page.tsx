"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { StaffProfileTabs } from "@/components/domain/staff/staff-profile-tabs";
import { useCurrentStaff } from "@/hooks/use-current-staff";
import { useAsync } from "@/hooks/use-async";
import { academicService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

export default function TeacherProfilePage() {
  const { data: staff, loading } = useCurrentStaff();
  const { data: department } = useAsync(
    () => (staff?.departmentId ? academicService.getDepartment(staff.departmentId) : Promise.resolve(null)),
    [staff?.departmentId],
  );
  const { t } = useLanguage();
  const bilingual = useBilingual();

  if (loading || !staff) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.profile")} />
      <div className="flex items-center gap-4 rounded-lg border border-border p-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-primary/10 text-base text-primary">{staff.photoInitials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-semibold text-foreground">{bilingual(staff.name)}</p>
          <p className="text-sm text-muted-foreground">{department ? bilingual(department.name) : ""}</p>
        </div>
      </div>
      <div className="rounded-lg border border-border p-4">
        <StaffProfileTabs staff={staff} department={department} />
      </div>
    </div>
  );
}
