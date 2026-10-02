"use client";

import type { Department, Staff } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

const DESIGNATION_LABEL: Record<Staff["designation"], { en: string; bn: string }> = {
  "chief-instructor": { en: "Chief Instructor", bn: "চীফ ইন্সট্রাক্টর" },
  instructor: { en: "Instructor", bn: "ইন্সট্রাক্টর" },
  "junior-instructor": { en: "Junior Instructor", bn: "জুনিয়র ইন্সট্রাক্টর" },
  "workshop-super": { en: "Workshop Super", bn: "ওয়ার্কশপ সুপার" },
  principal: { en: "Principal (Additional Responsibility)", bn: "অধ্যক্ষ (অতিরিক্ত দায়িত্ব)" },
  "vice-principal": { en: "Vice Principal / Academic In-charge", bn: "উপাধ্যক্ষ / একাডেমিক ইন-চার্জ" },
  registrar: { en: "Registrar", bn: "রেজিস্ট্রার" },
  "office-staff": { en: "Office Staff", bn: "অফিস স্টাফ" },
};

export function StaffProfileTabs({
  staff,
  department,
  trainingActions,
}: {
  staff: Staff;
  department?: Department | null;
  trainingActions?: React.ReactNode;
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">{locale === "bn" ? "ব্যক্তিগত" : "Personal"}</TabsTrigger>
        <TabsTrigger value="academic">{locale === "bn" ? "দায়িত্ব" : "Assignment"}</TabsTrigger>
        <TabsTrigger value="training">{locale === "bn" ? "প্রশিক্ষণ" : "Training"}</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="grid gap-4 pt-4 sm:grid-cols-2">
        <Field label={locale === "bn" ? "নাম" : "Name"} value={bilingual(staff.name)} />
        <Field label={locale === "bn" ? "পদবী" : "Designation"} value={bilingual(DESIGNATION_LABEL[staff.designation])} />
        <Field label={locale === "bn" ? "ফোন" : "Phone"} value={staff.phone} />
        <Field label={locale === "bn" ? "ইমেইল" : "Email"} value={staff.email} />
        <Field label={locale === "bn" ? "যোগদানের তারিখ" : "Joining Date"} value={formatDate(staff.joiningDate, locale)} />
        <div>
          <p className="text-xs text-muted-foreground">{locale === "bn" ? "অবস্থা" : "Status"}</p>
          <div className="mt-1"><StatusBadge status={staff.status} /></div>
        </div>
      </TabsContent>

      <TabsContent value="academic" className="grid gap-4 pt-4 sm:grid-cols-2">
        <Field label={locale === "bn" ? "বিভাগ" : "Department"} value={department ? bilingual(department.name) : (locale === "bn" ? "কেন্দ্রীয় প্রশাসন" : "Central administration")} />
        <Field label={locale === "bn" ? "শিফট" : "Shift"} value={staff.shift ?? "—"} />
        <Field label={locale === "bn" ? "বিভাগীয় প্রধান" : "Department Head"} value={staff.isDepartmentHead ? (locale === "bn" ? "হ্যাঁ" : "Yes") : (locale === "bn" ? "না" : "No")} />
      </TabsContent>

      <TabsContent value="training" className="pt-4">
        {trainingActions && <div className="mb-3">{trainingActions}</div>}
        {staff.trainings.length === 0 ? (
          <EmptyState title={locale === "bn" ? "কোনো প্রশিক্ষণ রেকর্ড নেই" : "No training records"} />
        ) : (
          <ul className="space-y-2">
            {staff.trainings.map((tr) => (
              <li key={tr.id} className="rounded-md border border-border px-3 py-2.5">
                <p className="text-sm font-medium text-foreground">{bilingual(tr.title)}</p>
                <p className="text-xs text-muted-foreground">
                  {bilingual(tr.institution)} · {tr.year} · {tr.durationWeeks} {locale === "bn" ? "সপ্তাহ" : "weeks"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
