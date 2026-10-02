"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Crown,
  ClipboardCheck,
  Building2,
  Presentation,
  GraduationCap,
  ArrowRight,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InstituteMark } from "@/components/shared/institute-mark";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { InlineSpinner } from "@/components/shared/loading";
import { useSession } from "@/components/shared/session-provider";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { ROLE_LABEL } from "@/lib/permissions/matrix";
import { ROLE_HOME } from "@/lib/permissions/routes";
import { sessionService } from "@/services";
import type { Role, SystemUser } from "@/types";

const ROLE_ICON: Record<Role, LucideIcon> = {
  principal: Crown,
  academic_incharge: ClipboardCheck,
  hod: Building2,
  teacher: Presentation,
  student: GraduationCap,
};

const ROLE_DESCRIPTION: Record<Role, { en: string; bn: string }> = {
  principal: {
    en: "Institute-wide oversight, user administration, and final result publication.",
    bn: "প্রতিষ্ঠানব্যাপী তদারকি, ইউজার প্রশাসন এবং চূড়ান্ত ফলাফল প্রকাশ।",
  },
  academic_incharge: {
    en: "Academic coordination and monitoring across all departments.",
    bn: "সকল বিভাগ জুড়ে একাডেমিক সমন্বয় ও তদারকি।",
  },
  hod: {
    en: "Manages one department's students, courses, routine, and mark verification.",
    bn: "নিজ বিভাগের শিক্ষার্থী, কোর্স, রুটিন ও নম্বর যাচাই পরিচালনা করেন।",
  },
  teacher: {
    en: "Assigned classes, attendance entry, and draft mark submission.",
    bn: "বরাদ্দকৃত ক্লাস, উপস্থিতি এন্ট্রি এবং খসড়া নম্বর জমাদান।",
  },
  student: {
    en: "Personal academic record — attendance, published results, and routine.",
    bn: "ব্যক্তিগত একাডেমিক তথ্য — উপস্থিতি, প্রকাশিত ফলাফল ও রুটিন।",
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <InlineSpinner className="size-6" />
    </div>
  );
}

function LoginPageContent() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user, ready, loginAs } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<SystemUser[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    sessionService.listDemoAccounts().then(setAccounts);
  }, []);

  useEffect(() => {
    if (ready && user) {
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : ROLE_HOME[user.role]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect-once-ready guard
  }, [ready, user]);

  const handleSelect = async (account: SystemUser) => {
    setPendingId(account.id);
    try {
      await loginAs(account.id);
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : ROLE_HOME[account.role]);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <InstituteMark size={34} />
          <span className="text-sm font-semibold text-foreground">{t("brand.name")}</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-16 sm:px-6">
        <div className="mb-8 max-w-2xl text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("action.exploreDemo")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "bn"
              ? "নিচে থেকে একটি ভূমিকা নির্বাচন করুন এবং সংশ্লিষ্ট ড্যাশবোর্ড অন্বেষণ করুন।"
              : "Choose a role below to explore the matching dashboard."}
          </p>
        </div>

        <Alert className="mb-8 max-w-2xl border-info/30 bg-info-soft text-info">
          <Info className="size-4" />
          <AlertTitle>{locale === "bn" ? "এটি একটি সিমুলেটেড লগইন" : "This is a simulated login"}</AlertTitle>
          <AlertDescription className="text-info/90">{t("demo.simulatedLogin")}</AlertDescription>
        </Alert>

        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = ROLE_ICON[account.role];
            const isPending = pendingId === account.id;
            return (
              <Card key={account.id} className="flex flex-col">
                <CardHeader>
                  <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{bilingual(ROLE_LABEL[account.role])}</CardTitle>
                  <CardDescription>{bilingual(ROLE_DESCRIPTION[account.role])}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {locale === "bn" ? "ডেমো ব্যবহারকারী:" : "Demo user:"}{" "}
                    <span className="font-medium text-foreground">{bilingual(account.name)}</span>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-1.5" onClick={() => handleSelect(account)} disabled={isPending}>
                    {isPending ? (
                      <InlineSpinner className="text-primary-foreground" />
                    ) : (
                      <>
                        {locale === "bn" ? "এভাবে চালিয়ে যান" : "Continue as"} {bilingual(ROLE_LABEL[account.role])}
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
