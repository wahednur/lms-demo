/**
 * Minimal CSV export utility — browser-only, no dependency. Used by every
 * report export button so column order/escaping stays consistent and the
 * file is unambiguously a CSV (brief §8/H: never label a CSV as "PDF").
 */
export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

function escapeCell(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCell(c.accessor(row))).join(","));
  return [header, ...lines].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // BOM so Excel on Windows renders Bengali (UTF-8) text correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
