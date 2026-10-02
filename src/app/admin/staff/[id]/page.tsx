"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Power } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/shared/loading";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StaffProfileTabs } from "@/components/domain/staff/staff-profile-tabs";
import { StaffFormDialog } from "@/components/domain/staff/staff-form-dialog";
import { AddTrainingDialog } from "@/components/domain/staff/add-training-dialog";
import { useAsync } from "@/hooks/use-async";
import { useSession } from "@/components/shared/session-provider";
import { academicService, staffService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { canManageUsers } from "@/lib/permissions/can";

export default function AdminStaffDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, loading, reload } = useAsync(async () => {
    const staff = await staffService.getById(params.id);
    if (!staff) return null;
    const [department, departments] = await Promise.all([
      staff.departmentId ? academicService.getDepartment(staff.departmentId) : Promise.resolve(null),
      academicService.listDepartments(),
    ]);
    return { staff, department, departments };
  }, [params.id]);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;
  if (!data.staff) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">{locale === "bn" ? "তথ্য পাওয়া যায়নি" : "Staff member not found"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/staff")}>{t("action.back")}</Button>
      </div>
    );
  }

  const { staff, department, departments } = data;
  const canManage = user ? canManageUsers(user.role) : false;
  const nextStatus = staff.status === "active" ? "inactive" : "active";

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      await staffService.setStatus(staff.id, nextStatus, user.id);
      toast.success(t("feedback.saved"));
      reload();
    } catch {
      toast.error(t("feedback.saveFailed"));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit gap-1" onClick={() => router.push("/admin/staff")}>
        <ArrowLeft className="size-3.5" /> {t("action.back")}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-base text-primary">{staff.photoInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{bilingual(staff.name)}</h1>
            <p className="text-sm text-muted-foreground">{department ? bilingual(department.name) : (locale === "bn" ? "কেন্দ্রীয় প্রশাসন" : "Central administration")}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <StaffFormDialog staff={staff} departments={departments} onSaved={reload} />
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setConfirmOpen(true)}>
              <Power className="size-3.5" />
              {staff.status === "active" ? t("action.deactivate") : t("action.activate")}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border p-4">
        <StaffProfileTabs
          staff={staff}
          department={department}
          trainingActions={canManage ? <AddTrainingDialog staffId={staff.id} onAdded={reload} /> : undefined}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={staff.status === "active" ? t("action.deactivate") : t("action.activate")}
        description={
          locale === "bn"
            ? `${staff.name.bn}-কে ${nextStatus === "active" ? "সক্রিয়" : "নিষ্ক্রিয়"} করবেন?`
            : `${nextStatus === "active" ? "Activate" : "Deactivate"} ${staff.name.en}?`
        }
        destructive={nextStatus === "inactive"}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
}
