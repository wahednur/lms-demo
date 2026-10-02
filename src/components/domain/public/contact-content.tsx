"use client";

import { MapPin, Phone, Mail, Info } from "lucide-react";
import type { Department, Staff } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

export function ContactContent({
  deptContacts,
}: {
  deptContacts: { department: Department; hod: Staff | null }[];
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{locale === "bn" ? "যোগাযোগ" : "Contact"}</h1>

      <Alert className="mt-4 border-info/30 bg-info-soft text-info">
        <Info className="size-4" />
        <AlertTitle>{locale === "bn" ? "প্লেসহোল্ডার তথ্য" : "Placeholder information"}</AlertTitle>
        <AlertDescription className="text-info/90">
          {locale === "bn"
            ? "নিচের ঠিকানা, ফোন নম্বর ও ইমেইল কাল্পনিক প্লেসহোল্ডার — প্রকৃত যোগাযোগের তথ্য নয়। এই পাতায় কোনো বার্তা পাঠানোর ফর্ম নেই।"
            : "The address, phone, and email below are fictional placeholders, not real contact details. This page has no message-submission form."}
        </AlertDescription>
      </Alert>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoCard icon={MapPin} title={locale === "bn" ? "ঠিকানা" : "Address"} lines={[locale === "bn" ? "ভাতশালা, শেরপুর" : "Bhatshala, Sherpur", "Bangladesh"]} />
        <InfoCard icon={Phone} title={locale === "bn" ? "ফোন" : "Phone"} lines={["+880-XXX-XXXXXX"]} />
        <InfoCard icon={Mail} title={locale === "bn" ? "ইমেইল" : "Email"} lines={["info@sgpi.example"]} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-foreground">
        {locale === "bn" ? "বিভাগীয় যোগাযোগ" : "Department contacts"}
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {deptContacts.map(({ department, hod }) => (
          <div key={department.id} className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground">{bilingual(department.name)}</p>
            {hod ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">{bilingual(hod.name)}</p>
                <p className="text-xs text-muted-foreground">{hod.email}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">—</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, lines }: { icon: typeof MapPin; title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-sm font-semibold text-foreground">{title}</p>
      {lines.map((l) => (
        <p key={l} className="text-xs text-muted-foreground">{l}</p>
      ))}
    </div>
  );
}
