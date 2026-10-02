"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Notice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";

const CATEGORY_LABEL: Record<Notice["category"], { en: string; bn: string }> = {
  academic: { en: "Academic", bn: "একাডেমিক" },
  examination: { en: "Examination", bn: "পরীক্ষা" },
  administrative: { en: "Administrative", bn: "প্রশাসনিক" },
  event: { en: "Event", bn: "ইভেন্ট" },
  holiday: { en: "Holiday", bn: "ছুটি" },
};

export function NoticeDetailContent({ notice }: { notice: Notice }) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  return (
    <div>
      <Link href="/notices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        {locale === "bn" ? "নোটিশে ফিরুন" : "Back to notices"}
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant="outline">{bilingual(CATEGORY_LABEL[notice.category])}</Badge>
        <span className="text-xs text-muted-foreground">{formatDate(notice.publishedAt, locale)}</span>
      </div>
      <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {bilingual(notice.title)}
      </h1>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">{bilingual(notice.body)}</p>

      <p className="mt-8 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        {locale === "bn" ? "এটি একটি প্রদর্শনী নোটিশ — কাল্পনিক কন্টেন্ট।" : "This is a demonstration notice — fictional content."}
      </p>
    </div>
  );
}
