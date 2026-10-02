"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { AddSubjectDialog } from "@/components/domain/academics/add-subject-dialog";
import { AddCourseAssignmentDialog } from "@/components/domain/academics/add-course-assignment-dialog";
import { useAsync } from "@/hooks/use-async";
import { academicService, staffService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { formatDate } from "@/lib/i18n/format";

const ALL = "all";
const SESSIONS = ["2025-2026", "2024-2025", "2023-2024", "2022-2023", "2021-2022"];

export default function AdminAcademicsPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const [departmentId, setDepartmentId] = useState(ALL);

  const { data, loading, reload } = useAsync(async () => {
    const [departments, subjects, assignments, staff, calendar] = await Promise.all([
      academicService.listDepartments(),
      academicService.listSubjects(),
      academicService.listCourseAssignments(),
      staffService.list({ pageSize: 100 }),
      academicService.listCalendarEvents(),
    ]);
    return { departments, subjects, assignments, teachers: staff.items.filter((s) => s.staffRole === "teacher" || s.staffRole === "hod"), calendar };
  }, []);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;

  const filteredSubjects = departmentId === ALL ? data.subjects : data.subjects.filter((s) => s.departmentId === departmentId);
  const filteredAssignments = departmentId === ALL ? data.assignments : data.assignments.filter((a) => a.departmentId === departmentId);
  const subjectById = new Map(data.subjects.map((s) => [s.id, s]));
  const teacherById = new Map(data.teachers.map((s) => [s.id, s]));
  const deptById = new Map(data.departments.map((d) => [d.id, d]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.admin.academics")} />

      <Select value={departmentId} onValueChange={setDepartmentId}>
        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("common.all")} {t("common.department")}</SelectItem>
          {data.departments.map((d) => <SelectItem key={d.id} value={d.id}>{bilingual(d.name)}</SelectItem>)}
        </SelectContent>
      </Select>

      <Tabs defaultValue="subjects">
        <TabsList>
          <TabsTrigger value="subjects">{locale === "bn" ? "বিষয়সমূহ" : "Subjects"}</TabsTrigger>
          <TabsTrigger value="assignments">{locale === "bn" ? "শিক্ষক বণ্টন" : "Course Distribution"}</TabsTrigger>
          <TabsTrigger value="calendar">{locale === "bn" ? "একাডেমিক ক্যালেন্ডার" : "Academic Calendar"}</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="pt-4">
          <div className="mb-3 flex justify-end">
            <AddSubjectDialog departments={data.departments} onAdded={reload} />
          </div>
          {filteredSubjects.length === 0 ? (
            <EmptyState title={t("table.noResults")} />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">{locale === "bn" ? "কোড" : "Code"}</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.subject")}</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.department")}</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">{t("common.semester")}</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "ধরন" : "Type"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((s) => {
                    const dept = deptById.get(s.departmentId);
                    return (
                      <tr key={s.id} className="border-t border-border even:bg-muted/20">
                        <td className="px-3 py-2 font-mono text-xs">{s.code}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{bilingual(s.name)}</td>
                        <td className="px-3 py-2 text-muted-foreground">{dept ? bilingual(dept.name) : "—"}</td>
                        <td className="px-3 py-2 text-right">{s.semester}</td>
                        <td className="px-3 py-2 text-right"><Badge variant="outline" className="text-[11px]">{s.type}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="pt-4">
          <div className="mb-3 flex justify-end">
            <AddCourseAssignmentDialog subjects={data.subjects} teachers={data.teachers} sessions={SESSIONS} onAdded={reload} />
          </div>
          {filteredAssignments.length === 0 ? (
            <EmptyState title={t("table.noResults")} />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.subject")}</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.teacher")}</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">{t("common.semester")}</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">{t("common.shift")}</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">{t("common.session")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a) => {
                    const subject = subjectById.get(a.subjectId);
                    const teacher = teacherById.get(a.teacherId);
                    return (
                      <tr key={a.id} className="border-t border-border even:bg-muted/20">
                        <td className="px-3 py-2 font-medium text-foreground">{subject ? bilingual(subject.name) : a.subjectId}</td>
                        <td className="px-3 py-2 text-muted-foreground">{teacher ? bilingual(teacher.name) : "—"}</td>
                        <td className="px-3 py-2 text-right">{a.semester}</td>
                        <td className="px-3 py-2 text-right">{a.shift}</td>
                        <td className="px-3 py-2 text-right">{a.session}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="pt-4">
          {data.calendar.length === 0 ? (
            <EmptyState title={t("table.noResults")} />
          ) : (
            <ul className="space-y-2">
              {data.calendar.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{bilingual(e.title)}</p>
                    {e.description && <p className="text-xs text-muted-foreground">{bilingual(e.description)}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(e.startDate, locale)}{e.endDate !== e.startDate ? ` – ${formatDate(e.endDate, locale)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
