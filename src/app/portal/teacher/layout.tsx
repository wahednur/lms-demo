"use client";

import {
  LayoutDashboard,
  UserRound,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  CalendarClock,
  FolderOpen,
} from "lucide-react";
import { AppSidebarShell, type NavGroup } from "@/components/layout/app-sidebar-shell";
import { useLanguage } from "@/lib/i18n/context";

export default function TeacherPortalLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  const navGroups: NavGroup[] = [
    {
      items: [
        { href: "/portal/teacher", label: t("nav.dashboard"), icon: LayoutDashboard },
        { href: "/portal/teacher/profile", label: t("nav.profile"), icon: UserRound },
        { href: "/portal/teacher/courses", label: t("nav.courses"), icon: BookOpen },
        { href: "/portal/teacher/attendance", label: t("nav.attendance"), icon: CalendarCheck },
        { href: "/portal/teacher/marks", label: t("nav.marks"), icon: ClipboardList },
        { href: "/portal/teacher/routine", label: t("nav.routine"), icon: CalendarClock },
        { href: "/portal/teacher/resources", label: t("nav.resources"), icon: FolderOpen },
      ],
    },
  ];

  return (
    <AppSidebarShell navGroups={navGroups} sectionTitle={t("portal.teacherTitle")} allowedRoles={["teacher"]}>
      {children}
    </AppSidebarShell>
  );
}
