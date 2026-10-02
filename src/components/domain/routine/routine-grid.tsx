"use client";

import type { RoutineSlot, Staff, Subject, Weekday } from "@/types";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const CLASS_DAYS: Weekday[] = ["sunday", "monday", "tuesday", "wednesday", "thursday"];

const DAY_LABEL: Record<Weekday, { en: string; bn: string }> = {
  sunday: { en: "Sunday", bn: "রবিবার" },
  monday: { en: "Monday", bn: "সোমবার" },
  tuesday: { en: "Tuesday", bn: "মঙ্গলবার" },
  wednesday: { en: "Wednesday", bn: "বুধবার" },
  thursday: { en: "Thursday", bn: "বৃহস্পতিবার" },
  friday: { en: "Friday", bn: "শুক্রবার" },
  saturday: { en: "Saturday", bn: "শনিবার" },
};

/** Grouped-by-day routine listing — chosen over a strict time-grid because
 * theory periods and practical double-blocks don't share a common row
 * height across different class cells; this stays clear and printable
 * without implying false alignment between unrelated time slots. */
export function RoutineGrid({
  slots,
  subjectById,
  teacherById,
  showClassLabel = false,
  renderActions,
}: {
  slots: RoutineSlot[];
  subjectById: Map<string, Subject>;
  teacherById?: Map<string, Staff>;
  showClassLabel?: boolean;
  renderActions?: (slot: RoutineSlot) => React.ReactNode;
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  if (slots.length === 0) {
    return <EmptyState title={locale === "bn" ? "কোনো রুটিন পাওয়া যায়নি" : "No routine found"} />;
  }

  return (
    <div className="print-area grid gap-4">
      {CLASS_DAYS.map((day) => {
        const daySlots = slots.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (daySlots.length === 0) return null;
        return (
          <div key={day} className="rounded-lg border border-border">
            <div className="border-b border-border bg-muted/40 px-4 py-2">
              <h3 className="text-sm font-semibold text-foreground">{DAY_LABEL[day][locale]}</h3>
            </div>
            <ul className="divide-y divide-border">
              {daySlots.map((slot) => {
                const subject = subjectById.get(slot.subjectId);
                const teacher = teacherById?.get(slot.teacherId);
                return (
                  <li key={slot.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{subject ? bilingual(subject.name) : slot.subjectId}</p>
                      <p className="text-xs text-muted-foreground">
                        {teacher ? bilingual(teacher.name) : ""}
                        {showClassLabel ? ` · ${locale === "bn" ? "সেমিস্টার" : "Sem"} ${slot.semester} (${slot.shift})` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-[11px]">{slot.kind === "theory" ? (locale === "bn" ? "থিওরি" : "Theory") : (locale === "bn" ? "প্র্যাকটিক্যাল" : "Practical")}</Badge>
                      <span className="text-xs text-muted-foreground">{slot.room}</span>
                      <span className="font-medium text-foreground">{slot.startTime}–{slot.endTime}</span>
                      {renderActions?.(slot)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
