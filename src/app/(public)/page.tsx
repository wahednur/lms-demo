import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstituteMark } from "@/components/shared/institute-mark";
import { DepartmentCard } from "@/components/domain/public/department-card";
import { NoticeListItem } from "@/components/domain/public/notice-list-item";
import { HomeIntro, HomeSectionHeading, HomeStat } from "@/components/domain/public/home-text";
import { academicService, noticeService, reportService, studentService } from "@/services";

export default async function HomePage() {
  const [departments, notices, summary] = await Promise.all([
    academicService.listDepartments(),
    noticeService.list({ audience: "all" }),
    reportService.instituteSummary(),
  ]);

  const enrollmentByDept = await Promise.all(
    departments.map(async (d) => {
      const page = await studentService.list({ departmentId: d.id, status: "active", pageSize: 1 });
      return [d.id, page.total] as const;
    }),
  );
  const enrollmentMap = Object.fromEntries(enrollmentByDept);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          <div className="flex-1">
            <div className="mb-5 flex items-center gap-3">
              <InstituteMark size={52} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              <HomeIntro field="name" />
            </h1>
            <p className="mt-2 text-base text-muted-foreground"><HomeIntro field="location" /></p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              <HomeIntro field="body" />
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-1.5">
                <Link href="/login">
                  <HomeIntro field="ctaPortal" />
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/departments"><HomeIntro field="ctaDepartments" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4">
          <HomeStat value={summary.totalStudents} labelKey="students" />
          <HomeStat value={summary.totalTeachers} labelKey="teachers" />
          <HomeStat value={summary.totalDepartments} labelKey="departments" />
          <HomeStat value={4} labelKey="shifts" suffix="-yr" />
        </div>
      </section>

      {/* Departments */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <HomeSectionHeading titleField="departmentsTitle" descField="departmentsDesc" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} studentCount={enrollmentMap[dept.id]} />
          ))}
        </div>
      </section>

      {/* Notices */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <HomeSectionHeading titleField="noticesTitle" descField="noticesDesc" />
            <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
              <Link href="/notices">
                <HomeIntro field="viewAll" />
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-3">
            {notices.slice(0, 5).map((notice) => (
              <NoticeListItem key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
