"use client";

import Link from "next/link";
import { CalendarCheck, GraduationCap, Clock, Bell, BookOpen, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { NoticeListItem } from "@/components/domain/public/notice-list-item";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { useStudentDashboard } from "@/hooks/use-student-dashboard";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { ROLE_LABEL } from "@/lib/permissions/matrix";

export default function StudentDashboardPage() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { data: dash, loading: dashLoading } = useStudentDashboard(student);
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  if (studentLoading || dashLoading || !student || !dash) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${locale === "bn" ? "স্বাগতম" : "Welcome"}, ${bilingual(student.name)}`}
        description={`${dash.department ? bilingual(dash.department.name) : ""} · ${locale === "bn" ? "সেমিস্টার" : "Semester"} ${student.semester} · ${student.session} · ${student.shift === "1st" ? (locale === "bn" ? "১ম শিফট" : "1st Shift") : (locale === "bn" ? "২য় শিফট" : "2nd Shift")}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={locale === "bn" ? "সার্বিক উপস্থিতি" : "Overall attendance"}
          value={`${dash.attendanceSummary.percent}%`}
          hint={`${dash.attendanceSummary.present}/${dash.attendanceSummary.totalClasses} ${locale === "bn" ? "ক্লাস" : "classes"}`}
          icon={CalendarCheck}
          tone={dash.attendanceSummary.percent < 75 ? "danger" : "success"}
        />
        <StatCard
          label={locale === "bn" ? "সর্বশেষ GPA" : "Latest GPA"}
          value={dash.latestResult ? dash.latestResult.gpa.toFixed(2) : "—"}
          hint={dash.latestResult ? `${locale === "bn" ? "সেমিস্টার" : "Semester"} ${dash.latestResult.semester}` : t("empty.notPublished")}
          icon={GraduationCap}
        />
        <StatCard
          label={locale === "bn" ? "আজকের ক্লাস" : "Today's classes"}
          value={dash.todaysClasses.length}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-primary" />
              {locale === "bn" ? "আজকের ক্লাস" : "Today's Classes"}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/portal/student/routine">{locale === "bn" ? "পূর্ণ রুটিন" : "Full routine"}</Link>
            </Button>
          </div>
          <div className="p-4">
            {dash.todaysClasses.length === 0 ? (
              <EmptyState title={t("empty.noClassesToday")} />
            ) : (
              <ul className="space-y-2">
                {dash.todaysClasses.map((slot) => (
                  <li key={slot.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {slot.subject ? bilingual(slot.subject.name) : slot.subjectId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.teacher ? bilingual(slot.teacher.name) : "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-foreground">{slot.startTime}–{slot.endTime}</p>
                      <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {slot.room}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell className="size-4 text-primary" />
              {t("nav.notices.short")}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/portal/student/notices">{locale === "bn" ? "সব দেখুন" : "View all"}</Link>
            </Button>
          </div>
          <div className="space-y-2 p-4">
            {dash.notices.length === 0 ? (
              <EmptyState title={t("empty.noNotices")} />
            ) : (
              dash.notices.slice(0, 4).map((n) => <NoticeListItem key={n.id} notice={n} />)
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="size-4 text-primary" />
            {locale === "bn" ? "লার্নিং রিসোর্স" : "Learning Resources"}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/portal/student/resources">{locale === "bn" ? "সব দেখুন" : "View all"}</Link>
          </Button>
        </div>
        <div className="p-4">
          {dash.resources.length === 0 ? (
            <EmptyState title={t("empty.noResources")} />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {dash.resources.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                  <span className="truncate text-sm text-foreground">{bilingual(r.title)}</span>
                  <Badge variant="outline" className="shrink-0 text-[10px]">{r.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {t("demo.sessionAs")}: {bilingual(ROLE_LABEL.student)}
      </p>
    </div>
  );
}
