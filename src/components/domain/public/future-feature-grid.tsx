"use client";

import Link from "next/link";
import {
  UserPlus,
  FileText,
  Wallet,
  MessageSquare,
  IdCard,
  ShieldCheck,
  Smartphone,
  Briefcase,
  Wrench,
  ArrowRight,
  Rocket,
} from "lucide-react";
import type { FutureFeature } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const ICON: Record<string, typeof UserPlus> = {
  "online-admission": UserPlus,
  "online-application": FileText,
  "fee-management": Wallet,
  "sms-email-notification": MessageSquare,
  "digital-id-card": IdCard,
  "certificate-verification": ShieldCheck,
  "mobile-application": Smartphone,
  "industrial-attachment-tracking": Briefcase,
  "lab-inventory": Wrench,
};

export function FutureFeatureGrid({ features }: { features: FutureFeature[] }) {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Rocket className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("nav.futureScope")}</h1>
          <p className="text-sm text-muted-foreground">
            {locale === "bn"
              ? "এই মডিউলগুলো প্রথম ধাপে বাস্তবায়িত হবে না — ভবিষ্যতে সম্প্রসারণের জন্য পরিকল্পিত।"
              : "These modules are not part of the first-release build — they're planned for future expansion."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = ICON[f.id] ?? Rocket;
          return (
            <Card key={f.id} className="flex flex-col">
              <CardHeader>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4.5" />
                  </div>
                  <Badge variant="outline" className="border-warning/40 bg-warning-soft text-[10px] text-warning">
                    {t("demo.futurePhaseLabel")}
                  </Badge>
                </div>
                <CardTitle className="text-base">{bilingual(f.title)}</CardTitle>
                <CardDescription>{bilingual(f.summary)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              {f.hasPreview && (
                <CardFooter>
                  <Link href={`/future/${f.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    {locale === "bn" ? "ধারণাগত প্রিভিউ দেখুন" : "View concept preview"}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
