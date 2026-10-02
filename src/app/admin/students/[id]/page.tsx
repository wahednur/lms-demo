"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarCheck, GraduationCap as GradCapIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/shared/loading";
import { StatCard } from "@/components/shared/stat-card";
import { StudentProfileTabs } from "@/components/domain/student/student-profile-tabs";
import { StudentFormDialog } from "@/components/domain/student/student-form-dialog";
import { PromoteStudentDialog } from "@/components/domain/student/promote-student-dialog";
import { MoveToAlumniDialog } from "@/components/domain/student/move-to-alumni-dialog";
import { useAsync } from "@/hooks/use-async";
import { useSession } from "@/components/shared/session-provider";
import { academicService, attendanceService, examService, studentService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { canEditStudentRecord } from "@/lib/permissions/can";

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();

  const { data, loading, reload } = useAsync(async () => {
    const student = await studentService.getById(params.id);
    if (!student) return null;
    const [department, attendanceSummary, resultHistory, departments] = await Promise.all([
      academicService.getDepartment(student.departmentId),
      attendanceService.getStudentSummary(student.id, student.session),
      examService.getStudentResultHistory(student.id),
      academicService.listDepartments(),
    ]);
    return { student, department, attendanceSummary, resultHistory, departments };
  }, [params.id]);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;
  if (!data.student) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">{locale === "bn" ? "শিক্ষার্থী পাওয়া যায়নি" : "Student not found"}</p>
        <Button variant="outline" onClick={() => router.push("/admin/students")}>{t("action.back")}</Button>
      </div>
    );
  }

  const { student, department, attendanceSummary, resultHistory } = data;
  const latestResult = resultHistory.at(-1) ?? null;
  const canEdit = user ? canEditStudentRecord(user.role) : false;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit gap-1" onClick={() => router.push("/admin/students")}>
        <ArrowLeft className="size-3.5" /> {t("action.back")}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-base text-primary">{student.photoInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{bilingual(student.name)}</h1>
            <p className="text-sm text-muted-foreground">
              {department ? bilingual(department.name) : ""} · {t("common.semester")} {student.semester} · {student.roll}
            </p>
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <StudentFormDialog student={student} departments={data.departments} sessions={["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"]} onSaved={reload} />
            <PromoteStudentDialog student={student} onPromoted={reload} />
            <MoveToAlumniDialog student={student} onMoved={reload} />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={locale === "bn" ? "উপস্থিতি" : "Attendance"}
          value={`${attendanceSummary.percent}%`}
          hint={`${attendanceSummary.present}/${attendanceSummary.totalClasses}`}
          icon={CalendarCheck}
          tone={attendanceSummary.percent < 75 ? "danger" : "success"}
        />
        <StatCard
          label={locale === "bn" ? "সর্বশেষ GPA" : "Latest GPA"}
          value={latestResult ? latestResult.gpa.toFixed(2) : "—"}
          icon={GradCapIcon}
        />
        <StatCard label={locale === "bn" ? "প্রকাশিত সেমিস্টার" : "Published semesters"} value={resultHistory.length} />
      </div>

      <div className="rounded-lg border border-border p-4">
        <StudentProfileTabs student={student} department={department} />
      </div>
    </div>
  );
}
