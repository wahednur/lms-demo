"use client";

import { Users, GraduationCap, Building2, BookOpen, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { formatNumber } from "@/lib/i18n/format";

const COPY = {
  name: {
    en: "Sherpur Government Polytechnic Institute",
    bn: "শেরপুর সরকারি পলিটেকনিক ইনস্টিটিউট",
  },
  location: { en: "Bhatshala, Sherpur, Bangladesh", bn: "ভাতশালা, শেরপুর, বাংলাদেশ" },
  body: {
    en: "A government polytechnic institute offering four-year diploma-in-engineering programs under the Bangladesh Technical Education Board. This site previews the institute's proposed Education Management Information System (EMIS) — a demonstration prototype built on fictional data.",
    bn: "বাংলাদেশ কারিগরি শিক্ষা বোর্ডের অধীনে চার বছর মেয়াদী ডিপ্লোমা ইঞ্জিনিয়ারিং প্রোগ্রাম পরিচালনাকারী একটি সরকারি পলিটেকনিক ইনস্টিটিউট। এই সাইটে প্রতিষ্ঠানের প্রস্তাবিত Education Management Information System (EMIS)-এর একটি প্রদর্শনী দেখানো হয়েছে — যা কাল্পনিক তথ্যের ভিত্তিতে তৈরি একটি প্রোটোটাইপ।",
  },
  ctaPortal: { en: "Explore the demo portal", bn: "ডেমো পোর্টাল দেখুন" },
  ctaDepartments: { en: "Browse departments", bn: "বিভাগসমূহ দেখুন" },
  viewAll: { en: "View all", bn: "সব দেখুন" },
  departmentsTitle: { en: "Technology departments", bn: "টেকনোলজি বিভাগসমূহ" },
  departmentsDesc: {
    en: "Four-year diploma-in-engineering programs across these departments, both shifts.",
    bn: "এই বিভাগগুলোতে উভয় শিফটে চার বছর মেয়াদী ডিপ্লোমা ইঞ্জিনিয়ারিং প্রোগ্রাম পরিচালিত হয়।",
  },
  noticesTitle: { en: "Latest notices", bn: "সাম্প্রতিক নোটিশ" },
  noticesDesc: {
    en: "Demonstration notices — all content below is fictional.",
    bn: "প্রদর্শনী নোটিশ — নিচের সকল তথ্য কাল্পনিক।",
  },
} as const;

type CopyField = keyof typeof COPY;

export function HomeIntro({ field }: { field: CopyField }) {
  const { locale } = useLanguage();
  return <>{COPY[field][locale]}</>;
}

export function HomeSectionHeading({
  titleField,
  descField,
}: {
  titleField: CopyField;
  descField: CopyField;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        <HomeIntro field={titleField} />
      </h2>
      <p className="mt-1 text-sm text-muted-foreground"><HomeIntro field={descField} /></p>
    </div>
  );
}

const STAT_LABEL = {
  students: { en: "Students", bn: "শিক্ষার্থী" },
  teachers: { en: "Teachers", bn: "শিক্ষক" },
  departments: { en: "Departments", bn: "বিভাগ" },
  shifts: { en: "Diploma program", bn: "ডিপ্লোমা প্রোগ্রাম" },
} as const;

// Icon components can't cross the Server->Client prop boundary (they aren't
// serializable), so this client component resolves its own icon from
// `labelKey` instead of receiving a component reference from the server page.
const STAT_ICON: Record<keyof typeof STAT_LABEL, LucideIcon> = {
  students: Users,
  teachers: GraduationCap,
  departments: Building2,
  shifts: BookOpen,
};

export function HomeStat({
  value,
  labelKey,
  suffix,
}: {
  value: number;
  labelKey: keyof typeof STAT_LABEL;
  suffix?: string;
}) {
  const Icon = STAT_ICON[labelKey];
  const { locale } = useLanguage();
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">
          {formatNumber(value, locale)}
          {suffix ?? ""}
        </p>
        <p className="text-xs text-muted-foreground">{STAT_LABEL[labelKey][locale]}</p>
      </div>
    </div>
  );
}
