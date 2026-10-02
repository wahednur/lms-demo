"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreateExaminationDialog } from "@/components/domain/exam/create-examination-dialog";
import { VerificationQueue } from "@/components/domain/exam/verification-queue";
import { useAsync } from "@/hooks/use-async";
import { academicService, examService, studentService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";

const ALL = "all";
const SESSIONS = ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

export default function AdminExaminationsPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const [departmentId, setDepartmentId] = useState(ALL);
  // Default to the current session — an unfiltered list spans every
  // historical examination ever generated (one per student's completed
  // semester), which is unusable as a flat grid. Scoping to one session
  // first keeps this page navigable; department/session narrow further.
  const [session, setSession] = useState(SESSIONS[0]);

  const { data, loading, reload } = useAsync(async () => {
    const filterDept = departmentId !== ALL ? departmentId : undefined;
    const [departments, subjects, examinations, submittedMarks, allStudents] = await Promise.all([
      academicService.listDepartments(),
      academicService.listSubjects(),
      examService.listExaminations({ departmentId: filterDept, session }),
      examService.listMarks({ departmentId: filterDept, status: "submitted" }),
      studentService.list({ departmentId: filterDept, pageSize: 500 }),
    ]);
    const sortedExams = [...examinations].sort((a, b) => b.startDate.localeCompare(a.startDate));
    return {
      departments,
      subjects,
      examinations: sortedExams,
      submittedMarks,
      subjectById: new Map(subjects.map((s) => [s.id, s])),
      studentById: new Map(allStudents.items.map((s) => [s.id, s])),
    };
  }, [departmentId, session]);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("nav.admin.examinations")}
        actions={<CreateExaminationDialog departments={data.departments} subjects={data.subjects} sessions={SESSIONS} onCreated={reload} />}
      />

      <div className="flex flex-wrap gap-2">
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")} {t("common.department")}</SelectItem>
            {data.departments.map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={session} onValueChange={setSession}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SESSIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {locale === "bn" ? "পরীক্ষাসমূহ" : "Examinations"}
            <span className="ml-2 font-normal text-muted-foreground">({data.examinations.length})</span>
          </h2>
        </div>
        <div className="max-h-[28rem] overflow-y-auto p-4">
          {data.examinations.length === 0 ? (
            <EmptyState title={t("table.noResults")} />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.examinations.map((e) => (
                <div key={e.id} className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{bilingual(e.name)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(e.startDate, locale)} – {formatDate(e.endDate, locale)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{e.subjectIds.length} {locale === "bn" ? "টি বিষয়" : "subjects"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">{locale === "bn" ? "যাচাইয়ের অপেক্ষায় নম্বর" : "Marks awaiting verification"}</h2>
          <StatusBadge status="submitted" />
        </div>
        <VerificationQueue
          marks={data.submittedMarks}
          studentById={data.studentById}
          subjectById={data.subjectById}
          onChanged={reload}
        />
      </div>
    </div>
  );
}
