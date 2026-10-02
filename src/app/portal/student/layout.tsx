"use client";

import {
  LayoutDashboard,
  UserRound,
  CalendarCheck,
  GraduationCap,
  CalendarClock,
  Bell,
  BookOpen,
} from "lucide-react";
import { AppSidebarShell, type NavGroup } from "@/components/layout/app-sidebar-shell";
import { useLanguage } from "@/lib/i18n/context";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  const navGroups: NavGroup[] = [
    {
      items: [
        { href: "/portal/student", label: t("nav.dashboard"), icon: LayoutDashboard },
        { href: "/portal/student/profile", label: t("nav.profile"), icon: UserRound },
        { href: "/portal/student/attendance", label: t("nav.attendance"), icon: CalendarCheck },
        { href: "/portal/student/results", label: t("nav.results"), icon: GraduationCap },
        { href: "/portal/student/routine", label: t("nav.routine"), icon: CalendarClock },
        { href: "/portal/student/notices", label: t("nav.notices.short"), icon: Bell },
        { href: "/portal/student/resources", label: t("nav.resources"), icon: BookOpen },
      ],
    },
  ];

  return (
    <AppSidebarShell navGroups={navGroups} sectionTitle={t("portal.studentTitle")} allowedRoles={["student"]}>
      {children}
    </AppSidebarShell>
  );
}
