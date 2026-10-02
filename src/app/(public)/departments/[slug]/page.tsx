import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { academicService, staffService, studentService } from "@/services";
import { DepartmentDetailHeader } from "@/components/domain/public/department-detail-header";
import { DepartmentStatBlock } from "@/components/domain/public/department-stat-block";
import { DepartmentSubjects } from "@/components/domain/public/department-subjects";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const dept = await academicService.getDepartment(slug);
  return { title: dept ? dept.name.en : "Department" };
}

export default async function DepartmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = await academicService.getDepartment(slug);
  if (!department) notFound();

  const [subjects, hod1, hod2, activeCount] = await Promise.all([
    academicService.listSubjects({ departmentId: department.id }),
    department.headOfDepartment["1st"] ? staffService.getById(department.headOfDepartment["1st"]!) : null,
    department.headOfDepartment["2nd"] ? staffService.getById(department.headOfDepartment["2nd"]!) : null,
    studentService.list({ departmentId: department.id, status: "active", pageSize: 1 }).then((p) => p.total),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <DepartmentDetailHeader department={department} hod1={hod1} hod2={hod2} />

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <DepartmentStatBlock value={activeCount} labelKey="activeStudents" />
        <DepartmentStatBlock value={department.establishedYear} labelKey="established" />
        <DepartmentStatBlock value={8} labelKey="semesters" />
      </dl>

      <div className="mt-10">
        <DepartmentSubjects subjects={subjects} />
      </div>
    </div>
  );
}
