"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FlaskConical, RotateCcw, ListChecks, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RoleSwitcher } from "@/components/shared/role-switcher";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useSession } from "@/components/shared/session-provider";
import { useLanguage } from "@/lib/i18n/context";
import { resetDemoData } from "@/lib/demo-reset";
import { cn } from "@/lib/utils";

interface Step {
  en: string;
  bn: string;
  href?: string;
}

const STEPS: Step[] = [
  { en: "Open the Principal dashboard", bn: "অধ্যক্ষের ড্যাশবোর্ড খুলুন", href: "/admin" },
  { en: "Find and add a student", bn: "একজন শিক্ষার্থী খুঁজুন ও যোগ করুন", href: "/admin/students" },
  { en: "Open the student's profile", bn: "শিক্ষার্থীর প্রোফাইল খুলুন", href: "/admin/students" },
  { en: "Switch to the assigned teacher", bn: "বরাদ্দকৃত শিক্ষকে পরিবর্তন করুন" },
  { en: "Record attendance", bn: "উপস্থিতি রেকর্ড করুন", href: "/portal/teacher/attendance" },
  { en: "Enter and submit draft marks", bn: "খসড়া নম্বর প্রবেশ ও জমা দিন", href: "/portal/teacher/marks" },
  { en: "Switch to Department Head and verify", bn: "বিভাগীয় প্রধানে পরিবর্তন করে যাচাই করুন", href: "/admin/examinations" },
  { en: "Switch to Principal and publish", bn: "অধ্যক্ষে পরিবর্তন করে প্রকাশ করুন", href: "/admin/results" },
  { en: "Switch to the student and view the published result", bn: "শিক্ষার্থীতে পরিবর্তন করে প্রকাশিত ফলাফল দেখুন", href: "/portal/student/results" },
  { en: "Export the relevant report", bn: "প্রাসঙ্গিক রিপোর্ট এক্সপোর্ট করুন", href: "/admin/reports" },
];

export function DemoHelper() {
  const { ready } = useSession();
  const { locale, t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());

  if (!ready) return null;

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleReset = async () => {
    resetDemoData();
    toast.success(locale === "bn" ? "ডেমো ডেটা রিসেট হয়েছে।" : "Demo data has been reset.");
    setDone(new Set());
    setOpen(false);
    router.push("/");
    // Force a reload so every in-memory service/session state re-hydrates from the fresh seed.
    setTimeout(() => window.location.reload(), 150);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed right-4 bottom-4 z-50 size-12 rounded-full shadow-lg"
            aria-label={locale === "bn" ? "ডেমো সহায়ক খুলুন" : "Open demo helper"}
          >
            <FlaskConical className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FlaskConical className="size-4 text-primary" />
              {locale === "bn" ? "ডেমো সহায়ক" : "Demo helper"}
            </SheetTitle>
            <SheetDescription>{t("demo.simulatedLogin")}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-4 pb-6">
            <section>
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t("action.switchRole")}
              </h3>
              <RoleSwitcher />
            </section>

            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <ListChecks className="size-3.5" />
                {locale === "bn" ? "গাইডেড ডেমো চেকলিস্ট" : "Guided demo checklist"}
              </h3>
              <ol className="flex flex-col gap-1">
                {STEPS.map((step, i) => {
                  const isDone = done.has(i);
                  const content = (
                    <>
                      {isDone ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className={cn("flex-1 text-left", isDone && "text-muted-foreground line-through")}>
                        {i + 1}. {locale === "bn" ? step.bn : step.en}
                      </span>
                    </>
                  );
                  return (
                    <li key={i} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggle(i)}
                        className="flex flex-1 items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {content}
                      </button>
                      {step.href && (
                        <Button asChild variant="ghost" size="sm" onClick={() => setOpen(false)}>
                          <Link href={step.href}>{locale === "bn" ? "যান" : "Go"}</Link>
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="rounded-lg border border-danger/30 bg-danger-soft p-3">
              <h3 className="mb-1 text-xs font-semibold text-foreground">{locale === "bn" ? "বিপদজনক অঞ্চল" : "Danger zone"}</h3>
              <p className="mb-2 text-xs text-muted-foreground">{t("demo.resetConfirmBody")}</p>
              <Button variant="destructive" size="sm" className="w-full gap-1.5" onClick={() => setResetOpen(true)}>
                <RotateCcw className="size-3.5" />
                {t("action.resetDemoData")}
              </Button>
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t("demo.resetConfirmTitle")}
        description={t("demo.resetConfirmBody")}
        destructive
        confirmLabel={t("action.resetDemoData")}
        onConfirm={handleReset}
      />
    </>
  );
}
