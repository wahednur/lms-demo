"use client";

import { Users, Calendar, Layers, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { formatNumber } from "@/lib/i18n/format";

const LABEL = {
  activeStudents: { en: "Active students", bn: "সক্রিয় শিক্ষার্থী" },
  established: { en: "Established", bn: "প্রতিষ্ঠাকাল" },
  semesters: { en: "Semesters", bn: "সেমিস্টার" },
} as const;

// Resolved internally from labelKey — icon components can't cross the
// Server->Client prop boundary (see components/domain/public/home-text.tsx).
const ICON: Record<keyof typeof LABEL, LucideIcon> = {
  activeStudents: Users,
  established: Calendar,
  semesters: Layers,
};

export function DepartmentStatBlock({
  value,
  labelKey,
}: {
  value: number;
  labelKey: keyof typeof LABEL;
}) {
  const { locale } = useLanguage();
  const Icon = ICON[labelKey];
  return (
    <div className="rounded-lg border border-border p-3">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="mt-1.5 text-lg font-semibold text-foreground">{formatNumber(value, locale)}</p>
      <p className="text-xs text-muted-foreground">{LABEL[labelKey][locale]}</p>
    </div>
  );
}
