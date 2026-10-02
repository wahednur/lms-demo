"use client";

import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/shared/session-provider";
import { useLanguage } from "@/lib/i18n/context";

/**
 * In-page authorization guard for admin sub-sections restricted to a
 * capability (e.g. system setup / user management — Principal only per the
 * PDF's permission matrix). Hiding the nav link is a UX nicety, not a
 * guard — a direct URL visit must still be blocked (brief §4/§7).
 */
export function RequireCapability({ allowed, children }: { allowed: boolean; children: React.ReactNode }) {
  const { user } = useSession();
  const router = useRouter();
  const { t, locale } = useLanguage();

  if (!user) return null;
  if (!allowed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" />
        <p className="font-medium text-foreground">
          {locale === "bn" ? "এই পাতায় প্রবেশাধিকার নেই" : "You don't have access to this page"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {locale === "bn"
            ? "এই বিভাগ পরিচালনার অনুমতি শুধুমাত্র অধ্যক্ষের রয়েছে।"
            : "Only the Principal has permission to manage this section."}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
          {t("action.back")}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}
