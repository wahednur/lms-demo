"use client";

import { PageHeader } from "@/components/shared/page-header";
import { RequireCapability } from "@/components/shared/require-capability";
import { useSession } from "@/components/shared/session-provider";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { canManageUsers } from "@/lib/permissions/can";
import {
  MATRIX_FUNCTIONS,
  MATRIX_FUNCTION_LABEL,
  PERMISSION_MATRIX,
  PERMISSION_LEVEL_LABEL,
  ROLE_LABEL,
} from "@/lib/permissions/matrix";
import { ROLES } from "@/types";
import { cn } from "@/lib/utils";

const LEVEL_TONE: Record<string, string> = {
  "full-access": "bg-success-soft text-success",
  "no-access": "bg-muted text-muted-foreground",
  approve: "bg-success-soft text-success",
  "view-all": "bg-info-soft text-info",
  "view-only": "bg-muted text-muted-foreground",
  "view-coordinate": "bg-info-soft text-info",
  "create-monitor": "bg-info-soft text-info",
  "coordinate-monitor": "bg-info-soft text-info",
  "create-edit": "bg-warning-soft text-warning",
  "monitor-verify": "bg-warning-soft text-warning",
  "verify-approve": "bg-success-soft text-success",
  "entry-edit": "bg-warning-soft text-warning",
  "view-own-marks": "bg-muted text-muted-foreground",
  "monitor-all-dept": "bg-info-soft text-info",
  "dept-view": "bg-muted text-muted-foreground",
  "class-entry": "bg-warning-soft text-warning",
  "view-own": "bg-muted text-muted-foreground",
  "generate-review": "bg-info-soft text-info",
  "department-report": "bg-warning-soft text-warning",
  "own-class-report": "bg-muted text-muted-foreground",
  "own-report": "bg-muted text-muted-foreground",
  "final-approve": "bg-success-soft text-success",
  "review-coordinate": "bg-info-soft text-info",
  verify: "bg-warning-soft text-warning",
  recommend: "bg-muted text-muted-foreground",
  "apply-only": "bg-muted text-muted-foreground",
};

export default function AdminRolesPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();

  return (
    <RequireCapability allowed={user ? canManageUsers(user.role) : false}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("nav.admin.roles")}
          description={locale === "bn" ? "প্রস্তাবনার পৃষ্ঠা ৫-এর অ্যাক্সেস পারমিশন ম্যাট্রিক্স অনুযায়ী" : "Per the access permission matrix on page 5 of the proposal"}
        />

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="sticky left-0 bg-muted/60 px-3 py-2.5 text-left font-medium text-muted-foreground">
                  {locale === "bn" ? "ফাংশন / মডিউল" : "Function / Module"}
                </th>
                {ROLES.map((r) => (
                  <th key={r} className="px-3 py-2.5 text-center font-medium text-muted-foreground">{bilingual(ROLE_LABEL[r])}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_FUNCTIONS.map((fn) => (
                <tr key={fn} className="border-t border-border even:bg-muted/20">
                  <td className="sticky left-0 bg-inherit px-3 py-2.5 font-medium text-foreground">{bilingual(MATRIX_FUNCTION_LABEL[fn])}</td>
                  {ROLES.map((r) => {
                    const level = PERMISSION_MATRIX[fn][r];
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", LEVEL_TONE[level])}>
                          {bilingual(PERMISSION_LEVEL_LABEL[level])}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          {locale === "bn"
            ? "এই ম্যাট্রিক্স ইউআই-স্তরের একটি সিমুলেশন। প্রকৃত বাস্তবায়নে সার্ভার-সাইড অথরাইজেশন বাধ্যতামূলক।"
            : "This matrix is a UI-level simulation. A production deployment must enforce the same rules server-side."}
        </p>
      </div>
    </RequireCapability>
  );
}
