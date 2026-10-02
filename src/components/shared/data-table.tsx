"use client";

import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * TanStack Table v9 — this project's list pages do server-side (mock-side)
 * pagination/sort/search via the typed services (see services/contracts),
 * so the table instance only needs the "core" feature slot: no
 * sortedRowModel/paginatedRowModel/filteredRowModel are registered, and
 * `data` is always exactly the current page the caller already fetched.
 * Sort-by-column is driven by plain `onSortChange(columnId)` — not
 * TanStack's own sorting state — because the actual ordering happens in
 * the service call, not in the browser.
 */
const dataTableFeatures = tableFeatures({});

export function createDataTableColumns<TData extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, TData>();
}

export interface SortState {
  sortBy: string | null;
  sortDir: "asc" | "desc";
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<typeof dataTableFeatures, TData, unknown>[];
  data: TData[];
  getRowId?: (row: TData, index: number) => string;
  loading?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  onRowClick?: (row: TData) => void;
  sort?: SortState;
  onSortChange?: (columnId: string) => void;
  pagination?: { page: number; pageSize: number; total: number };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  loading,
  emptyTitle,
  emptyDescription,
  onRowClick,
  sort,
  onSortChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  className,
}: DataTableProps<TData>) {
  const { t, locale } = useLanguage();
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId: getRowId as ((row: TData, index: number) => string) | undefined,
  });

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  const rangeFrom = pagination ? (pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1) : 0;
  const rangeTo = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : 0;

  const headerGroups = table.getHeaderGroups();

  if (loading) {
    return <TableSkeleton rows={6} cols={columns.length} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="bg-muted/60">
            {headerGroups.map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sortable = !!onSortChange && header.column.columnDef.meta?.sortable;
                  const isActive = sort?.sortBy === header.column.id;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className="border-b border-border px-3 py-2.5 text-left font-medium text-muted-foreground"
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={() => onSortChange!(header.column.id)}
                          className="inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <table.FlexRender header={header} />
                          {isActive ? (
                            sort?.sortDir === "asc" ? (
                              <ArrowUp className="size-3.5" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="size-3.5" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(
                  "border-b border-border last:border-0 even:bg-muted/20",
                  onRowClick && "cursor-pointer hover:bg-accent",
                )}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5 align-middle">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {t("table.showingRange", {
              from: rangeFrom.toLocaleString(locale === "bn" ? "bn-BD" : "en-US"),
              to: rangeTo.toLocaleString(locale === "bn" ? "bn-BD" : "en-US"),
              total: pagination.total.toLocaleString(locale === "bn" ? "bn-BD" : "en-US"),
            })}
          </p>
          <div className="flex items-center gap-2">
            {onPageSizeChange && (
              <Select value={String(pagination.pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                <SelectTrigger size="sm" className="w-[90px]" aria-label={t("table.rowsPerPage")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange?.(pagination.page - 1)}
                aria-label={t("action.previous")}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[5.5rem] text-center text-xs text-muted-foreground">
                {t("table.page", { page: pagination.page, pages: totalPages })}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagination.page >= totalPages}
                onClick={() => onPageChange?.(pagination.page + 1)}
                aria-label={t("action.next")}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
