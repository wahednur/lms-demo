"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Construction } from "lucide-react";
import type { FutureFeature } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const INCLUDES: Record<string, { en: string; bn: string }[]> = {
  "online-admission": [
    { en: "Prospective-student application form with department/shift preference", bn: "বিভাগ/শিফট পছন্দসহ ভর্তি আবেদন ফরম" },
    { en: "Seat-availability display per department", bn: "বিভাগভিত্তিক আসন সংখ্যা প্রদর্শন" },
    { en: "Application status tracking for applicants", bn: "আবেদনকারীদের জন্য আবেদনের অবস্থা ট্র্যাকিং" },
  ],
  "online-application": [
    { en: "Leave application with teacher recommendation → HOD verification → final approval", bn: "শিক্ষকের সুপারিশ → বিভাগীয় প্রধানের যাচাই → চূড়ান্ত অনুমোদন সহ ছুটির আবেদন" },
    { en: "Transcript / certificate request tracking", bn: "ট্রান্সক্রিপ্ট/সনদ অনুরোধ ট্র্যাকিং" },
  ],
  "fee-management": [
    { en: "Semester and exam fee invoicing", bn: "সেমিস্টার ও পরীক্ষার ফি ইনভয়েসিং" },
    { en: "Online payment gateway integration", bn: "অনলাইন পেমেন্ট গেটওয়ে ইন্টিগ্রেশন" },
    { en: "Digital receipt download", bn: "ডিজিটাল রসিদ ডাউনলোড" },
  ],
  "sms-email-notification": [
    { en: "Automatic SMS/email on result publication", bn: "ফলাফল প্রকাশে স্বয়ংক্রিয় এসএমএস/ইমেইল" },
    { en: "Low-attendance alerts to guardians", bn: "অভিভাবকদের কাছে কম উপস্থিতির সতর্কবার্তা" },
  ],
  "digital-id-card": [
    { en: "QR-verifiable digital ID generated from EMIS records", bn: "ইএমআইএস তথ্য থেকে তৈরি QR-যাচাইযোগ্য ডিজিটাল আইডি" },
  ],
  "industrial-attachment-tracking": [
    { en: "Partner-industry directory and placement assignment", bn: "অংশীদার শিল্প প্রতিষ্ঠানের তালিকা ও প্লেসমেন্ট বণ্টন" },
    { en: "Attendance and supervisor evaluation during attachment", bn: "অ্যাটাচমেন্ট চলাকালীন উপস্থিতি ও সুপারভাইজার মূল্যায়ন" },
  ],
  "lab-inventory": [
    { en: "Per-department equipment and chemical stock ledger", bn: "বিভাগভিত্তিক সরঞ্জাম ও রাসায়নিক দ্রব্যের মজুদ হিসাব" },
    { en: "Low-stock and maintenance-due alerts", bn: "কম মজুদ ও রক্ষণাবেক্ষণের প্রয়োজনীয়তার সতর্কবার্তা" },
  ],
};

export function FutureFeatureDetail({ feature }: { feature: FutureFeature }) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();
  const includes = INCLUDES[feature.id] ?? [];

  return (
    <div>
      <Link href="/future" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        {locale === "bn" ? "ভবিষ্যৎ পরিকল্পনায় ফিরুন" : "Back to future scope"}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{bilingual(feature.title)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{bilingual(feature.summary)}</p>

      <Alert className="mt-6 border-warning/40 bg-warning-soft text-warning">
        <Construction className="size-4" />
        <AlertTitle>{locale === "bn" ? "ধারণাগত প্রিভিউ — কার্যকর নয়" : "Concept preview — not functional"}</AlertTitle>
        <AlertDescription className="text-warning/90">
          {locale === "bn"
            ? "নিচের উপাদানগুলো শুধুমাত্র ধারণা দেখানোর জন্য, কোনো প্রকৃত লেনদেন, বার্তা, বা সনদ তৈরি হয় না।"
            : "The elements below illustrate the concept only — no real transaction, message, or certificate is generated."}
        </AlertDescription>
      </Alert>

      {includes.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{locale === "bn" ? "যা অন্তর্ভুক্ত থাকবে" : "What this would include"}</h2>
          <ul className="space-y-2">
            {includes.map((inc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                {bilingual(inc)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="relative mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-5">
        <div className="pointer-events-none select-none opacity-60">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input disabled placeholder={locale === "bn" ? "নমুনা ইনপুট ক্ষেত্র" : "Sample input field"} />
            <Input disabled placeholder={locale === "bn" ? "নমুনা ইনপুট ক্ষেত্র" : "Sample input field"} />
          </div>
          <Button disabled className="mt-3">{locale === "bn" ? "জমা দিন (নিষ্ক্রিয়)" : "Submit (disabled)"}</Button>
        </div>
        <span className="absolute top-2 right-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background">
          {locale === "bn" ? "মকআপ" : "MOCKUP"}
        </span>
      </div>
    </div>
  );
}
