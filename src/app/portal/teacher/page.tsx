"use client";

import Link from "next/link";
import { CalendarCheck, ClipboardList, AlertTriangle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { useCurrentStaff } from "@/hooks/use-current-staff";
import { useTeacherDashboard } from "@/hooks/use-teacher-dashboard";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

export default function TeacherDashboardPage() {
  const { data: staff, loading: staffLoading } = useCurrentStaff();
  const { data: dash, loading: dashLoading } = useTeacherDashboard(staff);
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  if (staffLoading || dashLoading || !staff || !dash) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${locale === "bn" ? "স্বাগতম" : "Welcome"}, ${bilingual(staff.name)}`}
        description={locale === "bn" ? "আজকের কাজের সারসংক্ষেপ" : "Here's what needs your attention today."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={locale === "bn" ? "আজকের ক্লাস" : "Today's classes"} value={dash.todaysClasses.length} icon={Clock} />
        <StatCard
          label={locale === "bn" ? "উপস্থিতি বাকি" : "Attendance pending"}
          value={dash.awaitingAttendance.length}
          icon={AlertTriangle}
          tone={dash.awaitingAttendance.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label={locale === "bn" ? "সংশোধনের জন্য ফেরত" : "Returned for correction"}
          value={dash.returnedMarksCount}
          icon={AlertTriangle}
          tone={dash.returnedMarksCount > 0 ? "danger" : "default"}
        />
        <StatCard label={locale === "bn" ? "যাচাইয়ের অপেক্ষায়" : "Awaiting verification"} value={dash.submittedMarksCount} icon={ClipboardList} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarCheck className="size-4 text-primary" />
              {locale === "bn" ? "উপস্থিতি নেওয়া বাকি" : "Classes awaiting attendance"}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/portal/teacher/attendance">{t("nav.attendance")}</Link>
            </Button>
          </div>
          <div className="p-4">
            {dash.awaitingAttendance.length === 0 ? (
              <EmptyState title={locale === "bn" ? "সব ক্লাসের উপস্থিতি নেওয়া হয়েছে" : "All of today's attendance is recorded"} />
            ) : (
              <ul className="space-y-2">
                {dash.awaitingAttendance.map((slot) => {
                  const subject = dash.subjectById.get(slot.subjectId);
                  return (
                    <li key={slot.id} className="flex items-center justify-between rounded-md border border-warning/30 bg-warning-soft px-3 py-2.5 text-sm">
                      <span className="font-medium text-foreground">{subject ? bilingual(subject.name) : slot.subjectId}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {slot.startTime}–{slot.endTime} <MapPin className="size-3" /> {slot.room}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-primary" />
              {locale === "bn" ? "আজকের সময়সূচি" : "Today's schedule"}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/portal/teacher/routine">{t("nav.routine")}</Link>
            </Button>
          </div>
          <div className="p-4">
            {dash.todaysClasses.length === 0 ? (
              <EmptyState title={t("empty.noClassesToday")} />
            ) : (
              <ul className="space-y-2">
                {dash.todaysClasses.map((slot) => {
                  const subject = dash.subjectById.get(slot.subjectId);
                  return (
                    <li key={slot.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
                      <span className="font-medium text-foreground">{subject ? bilingual(subject.name) : slot.subjectId}</span>
                      <span className="text-xs text-muted-foreground">{slot.startTime}–{slot.endTime} · {slot.room}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {(dash.returnedMarksCount > 0 || dash.draftMarksCount > 0) && (
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardList className="size-4 text-primary" />
              {locale === "bn" ? "নম্বর সংক্রান্ত কাজ বাকি" : "Pending mark entry"}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/portal/teacher/marks">{t("nav.marks")}</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 p-4 text-sm">
            {dash.returnedMarksCount > 0 && (
              <span className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-danger">
                {dash.returnedMarksCount} {locale === "bn" ? "টি এন্ট্রি সংশোধনের জন্য ফেরত এসেছে" : "entries returned for correction"}
              </span>
            )}
            {dash.draftMarksCount > 0 && (
              <span className="rounded-md border border-border bg-muted/40 px-3 py-2 text-muted-foreground">
                {dash.draftMarksCount} {locale === "bn" ? "টি খসড়া জমা দেওয়া বাকি" : "draft entries not yet submitted"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
