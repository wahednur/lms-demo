"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv, type CsvColumn } from "@/lib/csv";
import { useLanguage } from "@/lib/i18n/context";

export function ExportCsvButton<T>({
  rows,
  columns,
  filename,
}: {
  rows: T[];
  columns: CsvColumn<T>[];
  filename: string;
}) {
  const { t, locale } = useLanguage();
  return (
    <Button
      variant="outline"
      size="sm"
      className="no-print gap-1.5"
      disabled={rows.length === 0}
      onClick={() => {
        downloadCsv(filename, toCsv(rows, columns));
        toast.success(locale === "bn" ? "CSV ডাউনলোড হয়েছে" : "CSV downloaded");
      }}
    >
      <Download className="size-4" />
      {t("action.exportCsv")}
    </Button>
  );
}
