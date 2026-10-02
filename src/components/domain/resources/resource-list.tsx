"use client";

import { FileText, FileCheck2, FileQuestion, Download } from "lucide-react";
import { toast } from "sonner";
import type { Resource, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const TYPE_ICON = { "lecture-note": FileText, assignment: FileCheck2, syllabus: FileQuestion, other: FileText } as const;

export function ResourceList({ resources, subjectById }: { resources: Resource[]; subjectById: Map<string, Subject> }) {
  const { locale, t } = useLanguage();
  const bilingual = useBilingual();

  if (resources.length === 0) {
    return <EmptyState title={t("empty.noResources")} />;
  }

  return (
    <div className="grid gap-2">
      {resources.map((r) => {
        const Icon = TYPE_ICON[r.type];
        const subject = subjectById.get(r.subjectId);
        return (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{bilingual(r.title)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {subject ? bilingual(subject.name) : ""} · {r.fileName} · {r.fileSizeKb} KB
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() =>
                toast.info(
                  locale === "bn"
                    ? "এটি একটি ডেমো প্রোটোটাইপ — কোনো প্রকৃত ফাইল সংরক্ষিত নেই।"
                    : "This is a demo prototype — no real file is stored.",
                )
              }
            >
              <Download className="size-3.5" />
              {t("action.downloadPlaceholder")}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
