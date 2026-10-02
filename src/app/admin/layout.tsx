"use client";

import {
  LayoutDashboard,
  Users,
  UserRound,
  GraduationCap,
  CalendarCheck,
  FileText,
  Award,
  CalendarClock,
  BarChart3,
  UserCog,
  ShieldCheck,
  History,
  Settings as SettingsIcon,
  Wallet,
} from "lucide-react";
import { AppSidebarShell, type NavGroup } from "@/components/layout/app-sidebar-shell";
import { useSession } from "@/components/shared/session-provider";
import { useLanguage } from "@/lib/i18n/context";
import { canManageUsers } from "@/lib/permissions/can";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLanguage();
  const { user } = useSession();

  const navGroups: NavGroup[] = [
    {
      items: [{ href: "/admin", label: t("nav.admin.overview"), icon: LayoutDashboard }],
    },
    {
      label: t("common.department") + " & " + t("common.student"),
      items: [
        { href: "/admin/students", label: t("nav.admin.students"), icon: Users },
        { href: "/admin/staff", label: t("nav.admin.staff"), icon: UserRound },
        { href: "/admin/academics", label: t("nav.admin.academics"), icon: GraduationCap },
        { href: "/admin/routine", label: t("nav.admin.routine"), icon: CalendarClock },
      ],
    },
    {
      label: t("nav.admin.examinations"),
      items: [
        { href: "/admin/attendance", label: t("nav.admin.attendance"), icon: CalendarCheck },
        { href: "/admin/examinations", label: t("nav.admin.examinations"), icon: FileText },
        { href: "/admin/results", label: t("nav.admin.results"), icon: Award },
      ],
    },
    {
      label: t("nav.admin.reports"),
      items: [{ href: "/admin/reports", label: t("nav.admin.reports"), icon: BarChart3 }],
    },
  ];

  if (user && canManageUsers(user.role)) {
    navGroups.push({
      label: t("nav.admin.settings"),
      items: [
        { href: "/admin/users", label: t("nav.admin.users"), icon: UserCog },
        { href: "/admin/roles", label: t("nav.admin.roles"), icon: ShieldCheck },
        { href: "/admin/audit-logs", label: t("nav.admin.auditLogs"), icon: History },
        { href: "/admin/settings", label: t("nav.admin.settings"), icon: SettingsIcon },
        { href: "/admin/dev-cost", label: locale === "bn" ? "ডেভেলপমেন্ট খরচ" : "Development Cost", icon: Wallet },
      ],
    });
  }

  return (
    <AppSidebarShell
      navGroups={navGroups}
      sectionTitle={t("portal.adminTitle")}
      allowedRoles={["principal", "academic_incharge", "hod"]}
    >
      {children}
    </AppSidebarShell>
  );
}
