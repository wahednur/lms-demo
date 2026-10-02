"use client";

import { Info } from "lucide-react";
import type { SemesterResult, Subject } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";
import { GRADE_DISCLAIMER } from "@/lib/grading";

export function SemesterResultView({
  result,
  subjectById,
}: {
  result: SemesterResult;
  subjectById: Map<string, Subject>;
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <div>
          <p className="text-xs text-muted-foreground">{locale === "bn" ? "সেমিস্টার GPA" : "Semester GPA"}</p>
          <p className="text-xl font-semibold text-foreground">{result.gpa.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">CGPA</p>
          <p className="text-xl font-semibold text-foreground">{result.cgpa !== null ? result.cgpa.toFixed(2) : "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{locale === "bn" ? "প্রকাশের তারিখ" : "Published"}</p>
          <p className="text-sm font-medium text-foreground">{result.publishedAt ? formatDate(result.publishedAt, locale) : "—"}</p>
        </div>
        {result.hasFail && (
          <span className="rounded-full border border-danger/30 bg-danger-soft px-2.5 py-1 text-xs font-medium text-danger">
            {locale === "bn" ? "একটি বিষয়ে অকৃতকার্য" : "Fail in one or more subjects"}
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === "bn" ? "বিষয়" : "Subject"}</TableHead>
              <TableHead className="text-right">{locale === "bn" ? "মোট নম্বর" : "Total marks"}</TableHead>
              <TableHead className="text-right">{locale === "bn" ? "গ্রেড" : "Grade"}</TableHead>
              <TableHead className="text-right">{locale === "bn" ? "গ্রেড পয়েন্ট" : "Grade point"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.subjects.map((s) => {
              const subject = subjectById.get(s.subjectId);
              return (
                <TableRow key={s.subjectId}>
                  <TableCell>
                    <p className="font-medium text-foreground">{subject ? bilingual(subject.name) : s.subjectId}</p>
                    {subject && <p className="font-mono text-xs text-muted-foreground">{subject.code}</p>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{s.totalMarks}</TableCell>
                  <TableCell className="text-right font-medium">{s.grade}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.gradePoint.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Alert variant="default" className="border-border bg-muted/30">
        <Info className="size-4" />
        <AlertDescription className="text-muted-foreground">{GRADE_DISCLAIMER[locale]}</AlertDescription>
      </Alert>
    </div>
  );
}
