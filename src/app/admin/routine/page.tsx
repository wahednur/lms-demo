"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { PrintButton } from "@/components/shared/print-button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RoutineGrid } from "@/components/domain/routine/routine-grid";
import { AddRoutineSlotDialog } from "@/components/domain/routine/add-routine-slot-dialog";
import { useAsync } from "@/hooks/use-async";
import { useSession } from "@/components/shared/session-provider";
import { academicService, routineService, staffService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const ALL = "all";
const SESSIONS = ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

export default function AdminRoutinePage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [departmentId, setDepartmentId] = useState(ALL);
  const [semester, setSemester] = useState(ALL);
  const [shift, setShift] = useState(ALL);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, loading, reload } = useAsync(async () => {
    const [departments, subjects, assignments, staffPage, slots] = await Promise.all([
      academicService.listDepartments(),
      academicService.listSubjects(),
      academicService.listCourseAssignments(),
      staffService.list({ pageSize: 100 }),
      routineService.listSlots({
        departmentId: departmentId !== ALL ? departmentId : undefined,
        semester: semester !== ALL ? (Number(semester) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) : undefined,
        shift: shift !== ALL ? (shift as "1st" | "2nd") : undefined,
      }),
    ]);
    return {
      departments,
      subjects,
      assignments,
      teacherById: new Map(staffPage.items.map((s) => [s.id, s])),
      subjectById: new Map(subjects.map((s) => [s.id, s])),
      slots,
    };
  }, [departmentId, semester, shift]);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;

  const handleDelete = async () => {
    if (!deleteId || !user) return;
    await routineService.deleteSlot(deleteId, user.id);
    toast.success(t("feedback.deleted"));
    setDeleteId(null);
    reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("nav.admin.routine")}
        actions={
          <div className="flex gap-2">
            <PrintButton />
            <AddRoutineSlotDialog
              departments={data.departments}
              assignments={data.assignments}
              subjectById={data.subjectById}
              teacherById={data.teacherById}
              sessions={SESSIONS}
              onAdded={reload}
            />
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 no-print">
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")} {t("common.department")}</SelectItem>
            {data.departments.map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={semester} onValueChange={setSemester}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>{t("common.semester")} {s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={shift} onValueChange={setShift}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            <SelectItem value="1st">1st</SelectItem>
            <SelectItem value="2nd">2nd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <RoutineGrid
        slots={data.slots}
        subjectById={data.subjectById}
        teacherById={data.teacherById}
        showClassLabel={departmentId === ALL || semester === ALL}
        renderActions={(slot) => (
          <Button
            variant="ghost"
            size="icon-sm"
            className="no-print text-muted-foreground hover:text-danger"
            onClick={() => setDeleteId(slot.id)}
            aria-label={t("action.delete")}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("action.delete")}
        description={locale === "bn" ? "এই রুটিন স্লটটি মুছে ফেলতে চান?" : "Delete this routine slot?"}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
