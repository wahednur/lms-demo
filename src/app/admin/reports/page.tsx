"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { PrintButton } from "@/components/shared/print-button";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAsync } from "@/hooks/use-async";
import { academicService, attendanceService, examService, staffService, studentService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { computeSubjectResult, computeGpa } from "@/lib/grading";

const ALL = "all";

export default function AdminReportsPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const [departmentId, setDepartmentId] = useState(ALL);
  const [semester, setSemester] = useState(ALL);

  const { data, loading } = useAsync(async () => {
    const filterDept = departmentId !== ALL ? departmentId : undefined;
    const filterSem = semester !== ALL ? (Number(semester) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) : undefined;

    const [departments, studentsPage, staffPage, records, allMarks, subjects] = await Promise.all([
      academicService.listDepartments(),
      studentService.list({ departmentId: filterDept, semester: filterSem, pageSize: 500 }),
      staffService.list({ departmentId: filterDept, pageSize: 500 }),
      attendanceService.listRecords({ departmentId: filterDept, semester: filterSem }),
      examService.listMarks({ departmentId: filterDept, semester: filterSem, status: "published" }),
      academicService.listSubjects(),
    ]);

    const deptById = new Map(departments.map((d) => [d.id, d]));
    const subjectById = new Map(subjects.map((s) => [s.id, s]));

    // Per-student attendance aggregation from the already-fetched records (no N+1 service calls).
    const attendanceByStudent = new Map<string, { present: number; total: number }>();
    for (const r of records) {
      for (const e of r.entries) {
        const bucket = attendanceByStudent.get(e.studentId) ?? { present: 0, total: 0 };
        bucket.total++;
        if (e.status === "present") bucket.present++;
        attendanceByStudent.set(e.studentId, bucket);
      }
    }

    // Per-student GPA from published marks grouped by student+semester.
    const marksByStudentSem = new Map<string, typeof allMarks>();
    for (const m of allMarks) {
      const key = `${m.studentId}|${m.semester}`;
      marksByStudentSem.set(key, [...(marksByStudentSem.get(key) ?? []), m]);
    }
    const gpaByStudent = new Map<string, number>();
    for (const [key, marks] of marksByStudentSem) {
      const studentId = key.split("|")[0];
      const subjectResults = marks
        .map((m) => {
          const subject = subjectById.get(m.subjectId);
          return subject ? computeSubjectResult(m, subject) : null;
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);
      const { gpa } = computeGpa(subjectResults);
      gpaByStudent.set(studentId, gpa);
    }

    return { departments, students: studentsPage.items, staff: staffPage.items, deptById, attendanceByStudent, gpaByStudent };
  }, [departmentId, semester]);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;

  const studentRows = data.students.map((s) => {
    const att = data.attendanceByStudent.get(s.id);
    const dept = data.deptById.get(s.departmentId);
    return {
      student: s,
      deptName: dept ? bilingual(dept.name) : "",
      attendancePercent: att && att.total > 0 ? Math.round((att.present / att.total) * 1000) / 10 : null,
      gpa: data.gpaByStudent.get(s.id) ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6 print-area">
      <PageHeader title={t("nav.admin.reports")} actions={<PrintButton />} />

      <div className="flex flex-wrap gap-2 no-print">
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")} {t("common.department")}</SelectItem>
            {data.departments.map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={semester} onValueChange={setSemester}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("common.all")}</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>{t("common.semester")} {s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="register">
        <TabsList className="no-print flex-wrap">
          <TabsTrigger value="register">{locale === "bn" ? "শিক্ষার্থী রেজিস্টার" : "Student Register"}</TabsTrigger>
          <TabsTrigger value="staff">{locale === "bn" ? "শিক্ষক রিপোর্ট" : "Staff Report"}</TabsTrigger>
          <TabsTrigger value="attendance">{locale === "bn" ? "উপস্থিতি রিপোর্ট" : "Attendance Report"}</TabsTrigger>
          <TabsTrigger value="result">{locale === "bn" ? "ফলাফল রিপোর্ট" : "Result Report"}</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="pt-4">
          <div className="mb-3 flex justify-end no-print">
            <ExportCsvButton
              rows={studentRows}
              filename="student-register"
              columns={[
                { header: "Roll", accessor: (r) => r.student.roll },
                { header: "Registration No", accessor: (r) => r.student.registrationNo },
                { header: "Name (EN)", accessor: (r) => r.student.name.en },
                { header: "Name (BN)", accessor: (r) => r.student.name.bn },
                { header: "Department", accessor: (r) => r.deptName },
                { header: "Semester", accessor: (r) => r.student.semester },
                { header: "Shift", accessor: (r) => r.student.shift },
                { header: "Session", accessor: (r) => r.student.session },
                { header: "Status", accessor: (r) => r.student.status },
              ]}
            />
          </div>
          {studentRows.length === 0 ? <EmptyState title={t("table.noResults")} /> : (
            <ReportTable
              head={[locale === "bn" ? "রোল" : "Roll", t("common.student"), t("common.department"), t("common.semester"), locale === "bn" ? "অবস্থা" : "Status"]}
              rows={studentRows.map((r) => [r.student.roll, bilingual(r.student.name), r.deptName, String(r.student.semester), <StatusBadge key="s" status={r.student.status} />])}
            />
          )}
        </TabsContent>

        <TabsContent value="staff" className="pt-4">
          <div className="mb-3 flex justify-end no-print">
            <ExportCsvButton
              rows={data.staff}
              filename="staff-report"
              columns={[
                { header: "Name (EN)", accessor: (s: (typeof data.staff)[number]) => s.name.en },
                { header: "Designation", accessor: (s) => s.designation },
                { header: "Phone", accessor: (s) => s.phone },
                { header: "Email", accessor: (s) => s.email },
                { header: "Status", accessor: (s) => s.status },
              ]}
            />
          </div>
          {data.staff.length === 0 ? <EmptyState title={t("table.noResults")} /> : (
            <ReportTable
              head={[locale === "bn" ? "নাম" : "Name", locale === "bn" ? "পদবী" : "Designation", locale === "bn" ? "ফোন" : "Phone", locale === "bn" ? "অবস্থা" : "Status"]}
              rows={data.staff.map((s) => [bilingual(s.name), s.designation, s.phone, <StatusBadge key="s" status={s.status} />])}
            />
          )}
        </TabsContent>

        <TabsContent value="attendance" className="pt-4">
          <div className="mb-3 flex justify-end no-print">
            <ExportCsvButton
              rows={studentRows.filter((r) => r.attendancePercent !== null)}
              filename="attendance-report"
              columns={[
                { header: "Roll", accessor: (r) => r.student.roll },
                { header: "Name", accessor: (r) => r.student.name.en },
                { header: "Attendance %", accessor: (r) => r.attendancePercent ?? 0 },
              ]}
            />
          </div>
          {studentRows.filter((r) => r.attendancePercent !== null).length === 0 ? (
            <EmptyState title={t("empty.noAttendance")} />
          ) : (
            <ReportTable
              head={[locale === "bn" ? "রোল" : "Roll", t("common.student"), locale === "bn" ? "উপস্থিতির হার" : "Attendance %"]}
              rows={studentRows
                .filter((r) => r.attendancePercent !== null)
                .map((r) => [r.student.roll, bilingual(r.student.name), `${r.attendancePercent}%`])}
            />
          )}
        </TabsContent>

        <TabsContent value="result" className="pt-4">
          <div className="mb-3 flex justify-end no-print">
            <ExportCsvButton
              rows={studentRows.filter((r) => r.gpa !== null)}
              filename="result-report"
              columns={[
                { header: "Roll", accessor: (r) => r.student.roll },
                { header: "Name", accessor: (r) => r.student.name.en },
                { header: "GPA", accessor: (r) => r.gpa ?? 0 },
              ]}
            />
          </div>
          {studentRows.filter((r) => r.gpa !== null).length === 0 ? (
            <EmptyState title={t("empty.notPublished")} />
          ) : (
            <ReportTable
              head={[locale === "bn" ? "রোল" : "Roll", t("common.student"), "GPA"]}
              rows={studentRows.filter((r) => r.gpa !== null).map((r) => [r.student.roll, bilingual(r.student.name), r.gpa!.toFixed(2)])}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/60">
          <tr>{head.map((h, i) => <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border even:bg-muted/20">
              {row.map((cell, j) => <td key={j} className="px-3 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
