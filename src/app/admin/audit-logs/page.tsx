"use client";

import { useState } from "react";
import type { AuditAction, AuditLogEntry } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { RequireCapability } from "@/components/shared/require-capability";
import { DataTable, createDataTableColumns } from "@/components/shared/data-table";
import { useAsync } from "@/hooks/use-async";
import { useSession } from "@/components/shared/session-provider";
import { auditService, userService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { canManageUsers } from "@/lib/permissions/can";
import { formatDateTime } from "@/lib/i18n/format";

const ALL = "all";
const ACTIONS: AuditAction[] = [
  "login", "logout", "create", "update", "activate", "deactivate", "promote", "move-to-alumni",
  "attendance-save", "marks-draft", "marks-submit", "marks-return", "marks-verify", "marks-publish",
  "routine-edit", "report-export", "reset-demo-data",
];

export default function AdminAuditLogsPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [action, setAction] = useState(ALL);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data: usersPage } = useAsync(() => userService.list({ pageSize: 200 }), []);
  const userById = new Map((usersPage?.items ?? []).map((u) => [u.id, u]));

  const { data, loading } = useAsync(
    () => auditService.list({ action: action !== ALL ? (action as AuditAction) : undefined, page, pageSize }),
    [action, page],
  );

  const col = createDataTableColumns<AuditLogEntry>();
  const columns = col.columns([
    col.accessor("at", { header: t("common.date"), cell: (ctx) => formatDateTime(ctx.getValue() as string, locale) }),
    col.accessor((e) => userById.get(e.actorUserId), {
      id: "actor",
      header: locale === "bn" ? "ব্যবহারকারী" : "Actor",
      cell: (ctx) => {
        const u = ctx.getValue() as ReturnType<typeof userById.get>;
        return u ? bilingual(u.name) : "—";
      },
    }),
    col.accessor("action", { header: locale === "bn" ? "কার্যক্রম" : "Action" }),
    col.accessor("summary", { header: locale === "bn" ? "বিবরণ" : "Summary" }),
  ]);

  return (
    <RequireCapability allowed={user ? canManageUsers(user.role) : false}>
      <div className="flex flex-col gap-6">
        <PageHeader title={t("nav.admin.auditLogs")} />

        <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")} {locale === "bn" ? "কার্যক্রম" : "actions"}</SelectItem>
            {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={loading}
          getRowId={(e) => e.id}
          emptyTitle={t("table.noResults")}
          pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total } : undefined}
          onPageChange={setPage}
        />
      </div>
    </RequireCapability>
  );
}
