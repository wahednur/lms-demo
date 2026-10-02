"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InstituteMark } from "@/components/shared/institute-mark";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { DemoIndicator } from "@/components/shared/demo-indicator";
import { RoleSwitcher } from "@/components/shared/role-switcher";
import { PageLoading } from "@/components/shared/loading";
import { useSession } from "@/components/shared/session-provider";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { ROLE_LABEL } from "@/lib/permissions/matrix";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

export interface NavGroup {
  label?: string;
  items: { href: string; label: string; icon: LucideIcon }[];
}

export function AppSidebarShell({
  navGroups,
  sectionTitle,
  allowedRoles,
  children,
}: {
  navGroups: NavGroup[];
  sectionTitle: string;
  allowedRoles: Role[];
  children: ReactNode;
}) {
  const { user, ready, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(user.role === "student" ? "/portal/student" : user.role === "teacher" ? "/portal/teacher" : "/admin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-check only on session/route change
  }, [ready, user, pathname]);

  if (!ready || !user || !allowedRoles.includes(user.role)) {
    return <PageLoading label={t("table.loading")} />;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <InstituteMark size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{sectionTitle}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{t("brand.nameShort")}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNavList navGroups={navGroups} pathname={pathname} sectionTitle={sectionTitle} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 flex items-center gap-2 rounded-md px-1 py-1">
            <Avatar className="size-8">
              <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
                {initials(user.name.en)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{bilingual(user.name)}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{bilingual(ROLE_LABEL[user.role])}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground" onClick={handleLogout}>
            <LogOut className="size-4" /> {t("action.logout")}
          </Button>
          <a
            href="https://www.wahednur.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block truncate px-1 text-center text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 hover:underline"
          >
            {locale === "bn" ? "ডেভেলপার: Wahed Nur" : "Developed by Wahed Nur"}
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
                <SheetHeader className="border-b border-sidebar-border">
                  <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
                    <InstituteMark size={28} />
                    {sectionTitle}
                  </SheetTitle>
                </SheetHeader>
                <div className="py-2">
                  <SidebarNavList
                    navGroups={navGroups}
                    pathname={pathname}
                    sectionTitle={sectionTitle}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <DemoIndicator className="hidden sm:inline-flex" />
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <RoleSwitcher compact />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleLogout} aria-label={t("action.logout")}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function initials(nameEn: string): string {
  return nameEn.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function SidebarNavList({
  navGroups,
  pathname,
  sectionTitle,
  onNavigate,
}: {
  navGroups: NavGroup[];
  pathname: string;
  sectionTitle: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-4 px-3" aria-label={sectionTitle}>
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-sidebar-foreground/50 uppercase">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
