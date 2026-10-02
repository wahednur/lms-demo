"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { Department } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

export function DepartmentCard({
  department,
  studentCount,
}: {
  department: Department;
  studentCount?: number;
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();
  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="font-mono text-[11px]">{department.code}</Badge>
          {typeof studentCount === "number" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" /> {studentCount}
            </span>
          )}
        </div>
        <CardTitle className="text-base">{bilingual(department.name)}</CardTitle>
        <CardDescription className="line-clamp-2">{bilingual(department.description)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter>
        <Link
          href={`/departments/${department.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {locale === "bn" ? "বিস্তারিত দেখুন" : "View details"}
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
