import type { CellData, RowData, TableFeatures } from "@tanstack/table-core";

// Augments TanStack Table v9's per-column `meta` so DataTable can read a
// `sortable` flag without an `any` cast. See components/shared/data-table.tsx.
/* eslint-disable @typescript-eslint/no-unused-vars -- type params must match the merged interface's signature exactly */
declare module "@tanstack/table-core" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    sortable?: boolean;
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
