"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { RequireCapability } from "@/components/shared/require-capability";
import { InstituteMark } from "@/components/shared/institute-mark";
import { useAsync } from "@/hooks/use-async";
import { useSession } from "@/components/shared/session-provider";
import { academicService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";
import { canManageUsers } from "@/lib/permissions/can";
import { resetDemoData } from "@/lib/demo-reset";

export default function AdminSettingsPage() {
  const { t, locale } = useLanguage();
  const { user } = useSession();
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);

  const { data: sessions, loading } = useAsync(() => academicService.listSessions(), []);

  const handleReset = async () => {
    resetDemoData();
    toast.success(locale === "bn" ? "ডেমো ডেটা রিসেট হয়েছে। পুনরায় লগইন করুন।" : "Demo data reset. Please log in again.");
    router.push("/login");
  };

  return (
    <RequireCapability allowed={user ? canManageUsers(user.role) : false}>
      <div className="flex flex-col gap-6">
        <PageHeader title={t("nav.admin.settings")} />

        <div className="rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 pb-3">
            <Building2 className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{locale === "bn" ? "প্রতিষ্ঠান প্রোফাইল" : "Institute Profile"}</h2>
          </div>
          <div className="flex items-start gap-4">
            <InstituteMark size={48} />
            <dl className="grid flex-1 gap-3 sm:grid-cols-2">
              <Field label={locale === "bn" ? "নাম" : "Name"} value="Sherpur Government Polytechnic Institute" />
              <Field label={locale === "bn" ? "ঠিকানা" : "Address"} value="Bhatshala, Sherpur, Bangladesh" />
              <Field label={locale === "bn" ? "পরিচালনাকারী বোর্ড" : "Governing Board"} value="Bangladesh Technical Education Board (BTEB)" />
              <Field label={locale === "bn" ? "প্রোগ্রাম" : "Program"} value={locale === "bn" ? "৪ বছর মেয়াদী ডিপ্লোমা ইঞ্জিনিয়ারিং" : "4-Year Diploma in Engineering"} />
            </dl>
          </div>
          <p className="mt-4 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {locale === "bn"
              ? "এই প্রোটোটাইপে প্রোফাইল সম্পাদনা নিষ্ক্রিয় — এটি প্রস্তাবনায় উল্লেখিত প্রাতিষ্ঠানিক তথ্য প্রদর্শন করে।"
              : "Profile editing is disabled in this prototype — it displays the institutional facts named in the proposal."}
          </p>
        </div>

        <div className="rounded-lg border border-border p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{locale === "bn" ? "একাডেমিক সেশন" : "Academic Sessions"}</h2>
          {loading ? (
            <PageLoading label={t("table.loading")} />
          ) : (
            <ul className="space-y-1.5">
              {(sessions ?? []).map((s) => (
                <li key={s.label} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span className="font-medium text-foreground">{s.label}</span>
                  {s.isActive && <Badge className="bg-success-soft text-success">{locale === "bn" ? "চলমান" : "Active"}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-danger/30 bg-danger-soft p-5">
          <h2 className="mb-1 text-sm font-semibold text-foreground">{locale === "bn" ? "বিপদজনক অঞ্চল" : "Danger Zone"}</h2>
          <p className="mb-3 text-sm text-muted-foreground">{t("demo.resetConfirmBody")}</p>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-3.5" />
            {t("action.resetDemoData")}
          </Button>
        </div>

        <ConfirmDialog
          open={resetOpen}
          onOpenChange={setResetOpen}
          title={t("demo.resetConfirmTitle")}
          description={t("demo.resetConfirmBody")}
          destructive
          confirmLabel={t("action.resetDemoData")}
          onConfirm={handleReset}
        />
      </div>
    </RequireCapability>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
