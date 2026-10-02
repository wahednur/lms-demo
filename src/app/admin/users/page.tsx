"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, Power } from "lucide-react";
import type { Role, SystemUser } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, createDataTableColumns } from "@/components/shared/data-table";
import { RequireCapability } from "@/components/shared/require-capability";
import { UserFormDialog } from "@/components/domain/users/user-form-dialog";
import { useAsync } from "@/hooks/use-async";
import { useSession } from "@/components/shared/session-provider";
import { academicService, userService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { ROLE_LABEL } from "@/lib/permissions/matrix";
import { canManageUsers } from "@/lib/permissions/can";

const ALL = "all";

export default function AdminUsersPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user: actor } = useSession();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ALL);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: departments } = useAsync(() => academicService.listDepartments(), []);

  const { data, loading, reload } = useAsync(
    () => userService.list({ search: search || undefined, role: role !== ALL ? (role as Role) : undefined, page, pageSize }),
    [search, role, page],
  );

  const handleToggle = async (u: SystemUser) => {
    if (!actor) return;
    try {
      await userService.setActive(u.id, !u.active, actor.id);
      toast.success(t("feedback.saved"));
      reload();
    } catch {
      toast.error(t("feedback.saveFailed"));
    }
  };

  const col = createDataTableColumns<SystemUser>();
  const columns = col.columns([
    col.accessor((u) => bilingual(u.name), { id: "name", header: locale === "bn" ? "নাম" : "Name" }),
    col.accessor("email", { header: locale === "bn" ? "ইমেইল" : "Email" }),
    col.accessor((u) => bilingual(ROLE_LABEL[u.role]), { id: "role", header: locale === "bn" ? "রোল" : "Role" }),
    col.accessor("active", {
      header: locale === "bn" ? "অবস্থা" : "Status",
      cell: (ctx) => <StatusBadge status={ctx.getValue() ? "active" : "inactive"} />,
    }),
    col.display({
      id: "actions",
      header: "",
      cell: (ctx) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <UserFormDialog user={ctx.row.original} departments={departments ?? []} onSaved={reload} />
          <Button variant="ghost" size="icon-sm" onClick={() => handleToggle(ctx.row.original)} aria-label={ctx.row.original.active ? t("action.deactivate") : t("action.activate")}>
            <Power className="size-3.5" />
          </Button>
        </div>
      ),
    }),
  ]);

  return (
    <RequireCapability allowed={actor ? canManageUsers(actor.role) : false}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("nav.admin.users")}
          actions={<UserFormDialog departments={departments ?? []} onSaved={reload} />}
        />

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[14rem] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={locale === "bn" ? "নাম বা ইমেইল দিয়ে খুঁজুন" : "Search by name or email"} className="pl-8" />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("common.all")} {locale === "bn" ? "রোল" : "roles"}</SelectItem>
              {(["principal", "academic_incharge", "hod", "teacher", "student"] as const).map((r) => (
                <SelectItem key={r} value={r}>{bilingual(ROLE_LABEL[r])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={loading}
          getRowId={(u) => u.id}
          emptyTitle={t("table.noResults")}
          pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total } : undefined}
          onPageChange={setPage}
        />
      </div>
    </RequireCapability>
  );
}
