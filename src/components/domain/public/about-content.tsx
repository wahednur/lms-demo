"use client";

import { CheckCircle2, Target, Layers } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const OBJECTIVES = [
  { en: "Keep all important institutional data in one central system.", bn: "প্রতিষ্ঠানের সকল গুরুত্বপূর্ণ তথ্য একটি কেন্দ্রীয় সিস্টেমে সংরক্ষণ করা।" },
  { en: "Store, search, and update student information quickly.", bn: "শিক্ষার্থীদের তথ্য দ্রুত সংরক্ষণ, অনুসন্ধান ও হালনাগাদ করা।" },
  { en: "Manage teacher and staff information digitally.", bn: "শিক্ষক ও কর্মচারীদের তথ্য ডিজিটালভাবে ব্যবস্থাপনা করা।" },
  { en: "Record and monitor student attendance.", bn: "শিক্ষার্থীদের উপস্থিতি সংরক্ষণ ও পর্যবেক্ষণ করা।" },
  { en: "Make examination and result management simpler and more accurate.", bn: "পরীক্ষা ও ফলাফল ব্যবস্থাপনাকে সহজ ও নির্ভুল করা।" },
  { en: "Make routine and academic activity management easier.", bn: "রুটিন ও একাডেমিক কার্যক্রম ব্যবস্থাপনা সহজ করা।" },
  { en: "Generate various reports as needed.", bn: "প্রয়োজন অনুযায়ী বিভিন্ন ধরনের রিপোর্ট তৈরি করা।" },
  { en: "Reduce paper use and manual workload.", bn: "কাগজের ব্যবহার ও ম্যানুয়াল কাজের চাপ কমানো।" },
];

export function AboutContent() {
  const { locale } = useLanguage();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {locale === "bn" ? "প্রতিষ্ঠান পরিচিতি" : "About the Institute"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {locale === "bn"
            ? "শেরপুর সরকারি পলিটেকনিক ইনস্টিটিউট, ভাতশালা, শেরপুরে অবস্থিত বাংলাদেশ কারিগরি শিক্ষা বোর্ডের অধীনে পরিচালিত একটি সরকারি কারিগরি শিক্ষা প্রতিষ্ঠান। এখানে কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি, সিভিল টেকনোলজি, ইলেকট্রিক্যাল টেকনোলজি ও ইলেকট্রনিক্স টেকনোলজি বিভাগে উভয় শিফটে চার বছর মেয়াদী ডিপ্লোমা ইঞ্জিনিয়ারিং প্রোগ্রাম পরিচালিত হয়।"
            : "Sherpur Government Polytechnic Institute, located in Bhatshala, Sherpur, is a government technical education institute operating under the Bangladesh Technical Education Board (BTEB). It offers four-year diploma-in-engineering programs — in Computer Science & Technology, Civil Technology, Electrical Technology, and Electronics Technology — across both shifts."}
        </p>
      </div>

      <Alert className="border-info/30 bg-info-soft text-info">
        <Info className="size-4" />
        <AlertTitle>{locale === "bn" ? "এই EMIS সম্পর্কে" : "About this EMIS"}</AlertTitle>
        <AlertDescription className="text-info/90">
          {locale === "bn"
            ? "এই সাইট ও পোর্টাল একটি Education Management Information System (EMIS) চালুর প্রস্তাবের একটি প্রদর্শনী প্রোটোটাইপ। অধ্যক্ষের নীতিগত অনুমোদনের পর ধাপে ধাপে বাস্তবায়নের পরিকল্পনা অনুযায়ী এটি তৈরি করা হয়েছে। এখানে ব্যবহৃত সকল শিক্ষার্থী, শিক্ষক, নোটিশ ও পরিসংখ্যান কাল্পনিক।"
            : "This site and portal are a demonstration prototype for a proposed Education Management Information System (EMIS), built following the Principal's policy-level approval for phased implementation. Every student, teacher, notice, and statistic shown here is fictional."}
        </AlertDescription>
      </Alert>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {locale === "bn" ? "EMIS-এর উদ্দেশ্য" : "Objectives of the EMIS"}
          </h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {OBJECTIVES.map((obj, i) => (
            <li key={i} className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              <span className="text-foreground">{obj[locale]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            {locale === "bn" ? "একাডেমিক কাঠামো" : "Academic structure"}
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {locale === "bn"
            ? "প্রতিটি প্রোগ্রাম ৮টি সেমিস্টারে বিভক্ত, উভয় শিফটে (১ম ও ২য়) পরিচালিত হয়। ৮ম সেমিস্টারে ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট ও প্রজেক্ট অন্তর্ভুক্ত থাকে।"
            : "Each program runs across 8 semesters, offered in both the 1st and 2nd shift. The 8th semester includes industrial attachment and a capstone project."}
        </p>
      </div>
    </div>
  );
}
