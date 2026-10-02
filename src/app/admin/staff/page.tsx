"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Department, Designation, Staff } from "@/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, createDataTableColumns } from "@/components/shared/data-table";
import { StaffFormDialog } from "@/components/domain/staff/staff-form-dialog";
import { useAsync } from "@/hooks/use-async";
import { academicService, staffService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const ALL = "all";

const DESIGNATION_LABEL: Record<Designation, { en: string; bn: string }> = {
  "chief-instructor": { en: "Chief Instructor", bn: "চীফ ইন্সট্রাক্টর" },
  instructor: { en: "Instructor", bn: "ইন্সট্রাক্টর" },
  "junior-instructor": { en: "Junior Instructor", bn: "জুনিয়র ইন্সট্রাক্টর" },
  "workshop-super": { en: "Workshop Super", bn: "ওয়ার্কশপ সুপার" },
  principal: { en: "Principal (Additional Responsibility)", bn: "অধ্যক্ষ (অতিরিক্ত দায়িত্ব)" },
  "vice-principal": { en: "Vice Principal", bn: "উপাধ্যক্ষ" },
  registrar: { en: "Registrar", bn: "রেজিস্ট্রার" },
  "office-staff": { en: "Office Staff", bn: "অফিস স্টাফ" },
};

export default function AdminStaffPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: departments } = useAsync(() => academicService.listDepartments(), []);
  const deptById = new Map((departments ?? []).map((d) => [d.id, d]));

  const { data, loading, reload } = useAsync(
    () =>
      staffService.list({
        search: search || undefined,
        departmentId: departmentId !== ALL ? departmentId : undefined,
        status: status !== ALL ? (status as "active" | "inactive") : undefined,
        page,
        pageSize,
      }),
    [search, departmentId, status, page],
  );

  const col = createDataTableColumns<Staff>();
  const columns = col.columns([
    col.accessor((s) => bilingual(s.name), { id: "name", header: locale === "bn" ? "নাম" : "Name" }),
    col.accessor((s) => bilingual(DESIGNATION_LABEL[s.designation]), { id: "designation", header: locale === "bn" ? "পদবী" : "Designation" }),
    col.accessor((s) => (s.departmentId ? deptById.get(s.departmentId) : null), {
      id: "department",
      header: t("common.department"),
      cell: (ctx) => {
        const dept = ctx.getValue() as Department | null;
        return dept ? bilingual(dept.name) : (locale === "bn" ? "কেন্দ্রীয়" : "Central");
      },
    }),
    col.accessor("phone", { header: locale === "bn" ? "ফোন" : "Phone" }),
    col.accessor("status", {
      header: locale === "bn" ? "অবস্থা" : "Status",
      cell: (ctx) => <StatusBadge status={ctx.getValue() as Staff["status"]} />,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("nav.admin.staff")}
        actions={<StaffFormDialog departments={departments ?? []} onSaved={reload} />}
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={locale === "bn" ? "নাম দিয়ে খুঁজুন" : "Search by name"} className="pl-8" />
        </div>
        <Select value={departmentId} onValueChange={(v) => { setDepartmentId(v); setPage(1); }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")} {t("common.department")}</SelectItem>
            {(departments ?? []).map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            <SelectItem value="active">{t("status.active")}</SelectItem>
            <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={loading}
        getRowId={(s) => s.id}
        emptyTitle={t("table.noResults")}
        onRowClick={(s) => router.push(`/admin/staff/${s.id}`)}
        pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total } : undefined}
        onPageChange={setPage}
      />
    </div>
  );
}
