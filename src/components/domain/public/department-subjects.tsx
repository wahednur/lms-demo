"use client";

import type { Subject } from "@/types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const TYPE_LABEL = {
  theory: { en: "Theory", bn: "থিওরি" },
  practical: { en: "Practical", bn: "প্র্যাকটিক্যাল" },
  both: { en: "Theory + Practical", bn: "থিওরি + প্র্যাকটিক্যাল" },
} as const;

export function DepartmentSubjects({ subjects }: { subjects: Subject[] }) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {locale === "bn" ? "সেমিস্টার-ভিত্তিক বিষয়সমূহ" : "Subjects by semester"}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {locale === "bn"
          ? "বিষয় কোড উদাহরণস্বরূপ — প্রকৃত বিটিইবি কোড নয়।"
          : "Subject codes are illustrative placeholders, not official BTEB codes."}
      </p>
      <Accordion type="single" collapsible className="mt-4">
        {semesters.map((sem) => {
          const semSubjects = subjects.filter((s) => s.semester === sem);
          if (semSubjects.length === 0) return null;
          return (
            <AccordionItem key={sem} value={`sem-${sem}`}>
              <AccordionTrigger>
                {locale === "bn" ? `সেমিস্টার ${sem}` : `Semester ${sem}`}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({semSubjects.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {semSubjects.map((subject) => (
                    <li key={subject.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{bilingual(subject.name)}</p>
                        <p className="font-mono text-xs text-muted-foreground">{subject.code}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[11px]">
                        {TYPE_LABEL[subject.type][locale]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
