"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NoticeListItem } from "@/components/domain/public/notice-list-item";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { noticeService } from "@/services";
import type { Notice, NoticeCategory } from "@/types";

const CATEGORIES: { value: NoticeCategory | "all"; label: { en: string; bn: string } }[] = [
  { value: "all", label: { en: "All categories", bn: "সকল ক্যাটাগরি" } },
  { value: "academic", label: { en: "Academic", bn: "একাডেমিক" } },
  { value: "examination", label: { en: "Examination", bn: "পরীক্ষা" } },
  { value: "administrative", label: { en: "Administrative", bn: "প্রশাসনিক" } },
  { value: "event", label: { en: "Event", bn: "ইভেন্ট" } },
  { value: "holiday", label: { en: "Holiday", bn: "ছুটি" } },
];

export default function NoticesPage() {
  const { locale } = useLanguage();
  const bilingual = useBilingual();
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [category, setCategory] = useState<NoticeCategory | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    noticeService.list().then(setNotices);
  }, []);

  const filtered = useMemo(() => {
    if (!notices) return [];
    return notices.filter((n) => {
      if (category !== "all" && n.category !== category) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return n.title.en.toLowerCase().includes(q) || n.title.bn.includes(q);
      }
      return true;
    });
  }, [notices, category, search]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {locale === "bn" ? "নোটিশ বোর্ড" : "Notice Board"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {locale === "bn"
          ? "সকল নোটিশ প্রদর্শনী উদ্দেশ্যে তৈরি কাল্পনিক কন্টেন্ট।"
          : "All notices are demonstration content and fictional."}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "bn" ? "নোটিশ খুঁজুন" : "Search notices"}
            className="pl-8"
          />
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as NoticeCategory | "all")}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{bilingual(c.label)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-3">
        {!notices ? (
          <TableSkeleton rows={5} cols={1} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={locale === "bn" ? "কোনো নোটিশ পাওয়া যায়নি" : "No notices found"}
            description={locale === "bn" ? "ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।" : "Try adjusting your search or filter."}
          />
        ) : (
          filtered.map((notice) => <NoticeListItem key={notice.id} notice={notice} />)
        )}
      </div>
    </div>
  );
}
