import type { Metadata } from "next";
import { academicService, staffService } from "@/services";
import { ContactContent } from "@/components/domain/public/contact-content";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const departments = await academicService.listDepartments();
  const deptContacts = await Promise.all(
    departments.map(async (d) => {
      const hod1 = d.headOfDepartment["1st"] ? await staffService.getById(d.headOfDepartment["1st"]!) : null;
      return { department: d, hod: hod1 };
    }),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <ContactContent deptContacts={deptContacts} />
    </div>
  );
}
