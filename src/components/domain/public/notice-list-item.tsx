"use client";

import Link from "next/link";
import type { Notice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/i18n/format";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const CATEGORY_LABEL: Record<Notice["category"], { en: string; bn: string }> = {
  academic: { en: "Academic", bn: "একাডেমিক" },
  examination: { en: "Examination", bn: "পরীক্ষা" },
  administrative: { en: "Administrative", bn: "প্রশাসনিক" },
  event: { en: "Event", bn: "ইভেন্ট" },
  holiday: { en: "Holiday", bn: "ছুটি" },
};

export function NoticeListItem({ notice }: { notice: Notice }) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();
  return (
    <Link
      href={`/notices/${notice.id}`}
      className="flex flex-col gap-1.5 rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="outline" className="text-[11px]">{bilingual(CATEGORY_LABEL[notice.category])}</Badge>
          <span className="text-xs text-muted-foreground">{formatDate(notice.publishedAt, locale)}</span>
        </div>
        <p className="truncate font-medium text-foreground">{bilingual(notice.title)}</p>
      </div>
    </Link>
  );
}
