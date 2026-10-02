"use client";

import type { Department, Student } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate, formatCurrencyBdt } from "@/lib/i18n/format";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export function StudentProfileTabs({
  student,
  department,
}: {
  student: Student;
  department?: Department | null;
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">{locale === "bn" ? "ব্যক্তিগত" : "Personal"}</TabsTrigger>
        <TabsTrigger value="guardian">{locale === "bn" ? "অভিভাবক" : "Guardian"}</TabsTrigger>
        <TabsTrigger value="academic">{locale === "bn" ? "একাডেমিক" : "Academic"}</TabsTrigger>
        <TabsTrigger value="stipend">{locale === "bn" ? "উপবৃত্তি" : "Stipend"}</TabsTrigger>
        <TabsTrigger value="history">{locale === "bn" ? "ইতিহাস" : "History"}</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="grid gap-4 pt-4 sm:grid-cols-2">
        <Field label={locale === "bn" ? "নাম" : "Name"} value={bilingual(student.name)} />
        <Field label={locale === "bn" ? "লিঙ্গ" : "Gender"} value={student.gender} />
        <Field label={locale === "bn" ? "জন্ম তারিখ" : "Date of Birth"} value={formatDate(student.dateOfBirth, locale)} />
        <Field label={locale === "bn" ? "রক্তের গ্রুপ" : "Blood Group"} value={student.bloodGroup} />
        <Field label={locale === "bn" ? "ফোন" : "Phone"} value={student.phone} />
        <Field label={locale === "bn" ? "ইমেইল" : "Email"} value={student.email} />
      </TabsContent>

      <TabsContent value="guardian" className="grid gap-4 pt-4 sm:grid-cols-2">
        <Field label={locale === "bn" ? "পিতার নাম" : "Father's Name"} value={bilingual(student.guardian.fatherName)} />
        <Field label={locale === "bn" ? "মাতার নাম" : "Mother's Name"} value={bilingual(student.guardian.motherName)} />
        <Field label={locale === "bn" ? "অভিভাবকের ফোন" : "Guardian Phone"} value={student.guardian.guardianPhone} />
        <div />
        <Field label={locale === "bn" ? "বর্তমান ঠিকানা" : "Present Address"} value={bilingual(student.guardian.presentAddress)} />
        <Field label={locale === "bn" ? "স্থায়ী ঠিকানা" : "Permanent Address"} value={bilingual(student.guardian.permanentAddress)} />
      </TabsContent>

      <TabsContent value="academic" className="grid gap-4 pt-4 sm:grid-cols-2">
        <Field label={locale === "bn" ? "বিভাগ" : "Department"} value={department ? bilingual(department.name) : "—"} />
        <Field label={locale === "bn" ? "রোল" : "Roll"} value={student.roll} />
        <Field label={locale === "bn" ? "রেজিস্ট্রেশন নম্বর" : "Registration No."} value={student.registrationNo} />
        <Field label={locale === "bn" ? "সেমিস্টার" : "Semester"} value={String(student.semester)} />
        <Field label={locale === "bn" ? "সেশন" : "Session"} value={student.session} />
        <Field label={locale === "bn" ? "শিফট" : "Shift"} value={student.shift} />
        <Field label={locale === "bn" ? "ভর্তির তারিখ" : "Admission Date"} value={formatDate(student.admissionDate, locale)} />
        <div>
          <p className="text-xs text-muted-foreground">{locale === "bn" ? "অবস্থা" : "Status"}</p>
          <div className="mt-1"><StatusBadge status={student.status} /></div>
        </div>
        {student.status === "alumni" && student.alumni && (
          <>
            <Field label={locale === "bn" ? "পাসের বছর" : "Passed Year"} value={String(student.alumni.passedYear)} />
            <Field label="CGPA" value={student.alumni.finalCgpa?.toFixed(2) ?? "—"} />
          </>
        )}
      </TabsContent>

      <TabsContent value="stipend" className="pt-4">
        {student.stipend.length === 0 ? (
          <EmptyState title={locale === "bn" ? "কোনো উপবৃত্তি রেকর্ড নেই" : "No stipend records"} />
        ) : (
          <div className="space-y-2">
            {student.stipend.map((s) => (
              <div key={s.session} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.session}</p>
                  {s.remarks && <p className="text-xs text-muted-foreground">{s.remarks}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={s.eligible ? "active" : "inactive"} />
                  {s.disbursed && s.amountBdt && (
                    <span className="text-sm font-medium text-success">{formatCurrencyBdt(s.amountBdt, locale)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="history" className="pt-4">
        {student.promotionHistory.length === 0 ? (
          <EmptyState title={locale === "bn" ? "কোনো প্রমোশন ইতিহাস নেই" : "No promotion history"} />
        ) : (
          <ol className="space-y-2">
            {student.promotionHistory.map((p, i) => (
              <li key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                <span>
                  {locale === "bn" ? "সেমিস্টার" : "Semester"} {p.fromSemester} → {p.toSemester}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(p.date, locale)} · {p.session}</span>
              </li>
            ))}
          </ol>
        )}
      </TabsContent>
    </Tabs>
  );
}
