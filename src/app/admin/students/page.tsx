"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Department, SemesterNumber, Shift, Student, StudentStatus } from "@/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, createDataTableColumns } from "@/components/shared/data-table";
import { StudentFormDialog } from "@/components/domain/student/student-form-dialog";
import { useAsync } from "@/hooks/use-async";
import { academicService, studentService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const ALL = "all";

export default function AdminStudentsPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState(ALL);
  const [semester, setSemester] = useState(ALL);
  const [shift, setShift] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: departments } = useAsync(() => academicService.listDepartments(), []);

  const { data, loading, reload } = useAsync(
    () =>
      studentService.list({
        search: search || undefined,
        departmentId: departmentId !== ALL ? departmentId : undefined,
        semester: semester !== ALL ? (Number(semester) as SemesterNumber) : undefined,
        shift: shift !== ALL ? (shift as Shift) : undefined,
        status: status !== ALL ? (status as StudentStatus) : undefined,
        page,
        pageSize,
      }),
    [search, departmentId, semester, shift, status, page],
  );

  const deptById = new Map((departments ?? []).map((d) => [d.id, d]));

  const col = createDataTableColumns<Student>();
  const columns = col.columns([
    col.accessor("roll", { header: locale === "bn" ? "রোল" : "Roll" }),
    col.accessor((s) => bilingual(s.name), { id: "name", header: t("common.student") }),
    col.accessor((s) => deptById.get(s.departmentId), {
      id: "department",
      header: t("common.department"),
      cell: (ctx) => {
        const dept = ctx.getValue() as Department | undefined;
        return dept ? bilingual(dept.name) : "—";
      },
    }),
    col.accessor("semester", { header: t("common.semester") }),
    col.accessor("shift", { header: t("common.shift") }),
    col.accessor("status", {
      header: locale === "bn" ? "অবস্থা" : "Status",
      cell: (ctx) => <StatusBadge status={ctx.getValue() as Student["status"]} />,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("nav.admin.students")}
        actions={
          <StudentFormDialog
            departments={departments ?? []}
            sessions={["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"]}
            onSaved={reload}
          />
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t("table.searchPlaceholder")} className="pl-8" />
        </div>
        <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")} {t("common.department")}</SelectItem>
            {(departments ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={semester} onValueChange={(v) => { setSemester(v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>{t("common.semester")} {s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={shift} onValueChange={(v) => { setShift(v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            <SelectItem value="1st">{locale === "bn" ? "১ম শিফট" : "1st Shift"}</SelectItem>
            <SelectItem value="2nd">{locale === "bn" ? "২য় শিফট" : "2nd Shift"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            <SelectItem value="active">{t("status.active")}</SelectItem>
            <SelectItem value="alumni">{t("status.alumni")}</SelectItem>
            <SelectItem value="dropped">{t("status.dropped")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={loading}
        getRowId={(s) => s.id}
        emptyTitle={t("table.noResults")}
        onRowClick={(s) => router.push(`/admin/students/${s.id}`)}
        pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total } : undefined}
        onPageChange={setPage}
      />
    </div>
  );
}
