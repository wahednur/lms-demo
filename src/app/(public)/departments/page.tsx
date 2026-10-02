import type { Metadata } from "next";
import { DepartmentCard } from "@/components/domain/public/department-card";
import { HomeSectionHeading } from "@/components/domain/public/home-text";
import { academicService, studentService } from "@/services";

export const metadata: Metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const departments = await academicService.listDepartments();
  const counts = await Promise.all(
    departments.map(async (d) => {
      const page = await studentService.list({ departmentId: d.id, status: "active", pageSize: 1 });
      return [d.id, page.total] as const;
    }),
  );
  const countMap = Object.fromEntries(counts);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <HomeSectionHeading titleField="departmentsTitle" descField="departmentsDesc" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {departments.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} studentCount={countMap[dept.id]} />
        ))}
      </div>
    </div>
  );
}
