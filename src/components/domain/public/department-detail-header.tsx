"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Department, Staff } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

export function DepartmentDetailHeader({
  department,
  hod1,
  hod2,
}: {
  department: Department;
  hod1: Staff | null;
  hod2: Staff | null;
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  return (
    <div>
      <Link href="/departments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        {locale === "bn" ? "বিভাগসমূহে ফিরুন" : "Back to departments"}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <Badge variant="secondary" className="mb-2 font-mono">{department.code}</Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {bilingual(department.name)}
          </h1>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {bilingual(department.description)}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {([["1st", hod1], ["2nd", hod2]] as const).map(([shift, hod]) => (
          <div key={shift} className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {locale === "bn" ? `${shift === "1st" ? "১ম" : "২য়"} শিফট বিভাগীয় প্রধান` : `${shift} Shift Department Head`}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{hod ? bilingual(hod.name) : "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
