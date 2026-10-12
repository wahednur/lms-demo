"use client";

import { PageHeader } from "@/components/shared/page-header";
import { RequireCapability } from "@/components/shared/require-capability";
import { useSession } from "@/components/shared/session-provider";
import { canManageUsers } from "@/lib/permissions/can";

interface CostRow {
  module: string;
  duration: string;
  freelancer: string;
  agency: string;
  why: string;
  cheapRisk: string;
}

const ROWS: CostRow[] = [
  {
    module: "UI/UX ডিজাইন সিস্টেম ও পাবলিক ওয়েবসাইট (কালার/টাইপোগ্রাফি/কম্পোনেন্ট লাইব্রেরি + হোম/এবাউট/ডিপার্টমেন্ট/নোটিস/যোগাযোগ)",
    duration: "১০–১৪ দিন",
    freelancer: "১৪,০০০ – ২০,০০০ টাকা",
    agency: "৪০,০০০ – ৫৫,০০০ টাকা",
    why: "প্রতিষ্ঠানের প্রথম পরিচয় ও পুরো সিস্টেমের ভিজুয়াল আইডেন্টিটি এখানে ঠিক হয় — কালার/টাইপোগ্রাফি/কম্পোনেন্ট লাইব্রেরি সব প্যানেলে পুনর্ব্যবহৃত হয়, SEO ও মোবাইল-রেসপন্সিভ ডিজাইন লাগে।",
    cheapRisk: "দুর্বল ডিজাইন সিস্টেমে প্রতিটি প্যানেলে ভিন্ন ভিন্ন স্টাইল তৈরি হয়, পরে সামঞ্জস্য আনতে বাড়তি সময়-খরচ লাগে; খারাপ রেসপন্সিভ ডিজাইন ও বাংলা ফন্ট রেন্ডারিং সমস্যাও দেখা দিতে পারে।",
  },
  {
    module: "ডেটাবেস ডিজাইন ও নরমালাইজেশন",
    duration: "৭–১০ দিন",
    freelancer: "১১,০০০ – ১৭,০০০ টাকা",
    agency: "৩০,০০০ – ৪৫,০০০ টাকা",
    why: "Students, Staff, Academics, Attendance, Exam, Routine, Users/Roles, Audit — প্রতিটির জন্য 3NF নরমালাইজড স্কিমা, রিলেশনশিপ ম্যাপিং ও ইন্ডেক্সিং এখানেই ঠিক হয়।",
    cheapRisk: "দুর্বল ডিজাইনে ডেটা অসঙ্গতি তৈরি হয়, পরে পুরো সিস্টেম রিবিল্ড করতে হয় — খরচ তখন ৩–৪ গুণ বেড়ে যায়।",
  },
  {
    module: "ব্যাকএন্ড API ও অথেনটিকেশন (লগইন, RBAC, CRUD API, ফাইল আপলোড, ভ্যালিডেশন)",
    duration: "২৫–৩৫ দিন",
    freelancer: "২৮,০০০ – ৪৪,০০০ টাকা",
    agency: "৮০,০০০ – ১,২০,০০০ টাকা",
    why: "প্রজেক্টের সবচেয়ে বড় ও সময়সাপেক্ষ অংশ — Login/Session, Role-Based Access Control (Admin/Teacher/Student/Guardian/Alumni), প্রতিটি মডিউলের CRUD API, ইনপুট ভ্যালিডেশন, নোটিফিকেশন সিস্টেম — প্রতিটি প্যানেল এই লেয়ারের উপর নির্ভরশীল।",
    cheapRisk: "দুর্বল পারমিশন চেকে একজন শিক্ষক অন্যের রেজাল্ট এডিট করতে পারার মত নিরাপত্তা ফাঁক থাকতে পারে; এই লেয়ারে ভুল হলে প্রতিটি প্যানেলে এর প্রভাব পড়ে।",
  },
  {
    module: "অ্যাডমিন প্যানেল — সম্পূর্ণ নতুন (UI + Backend, ১২ সাব-মডিউল)",
    duration: "২০–২৮ দিন",
    freelancer: "২৫,০০০ – ৩৫,০০০ টাকা",
    agency: "৭০,০০০ – ৯৫,০০০ টাকা",
    why: "Students, Staff, Academics, Attendance, Examinations, Results, Routine, Roles, Users, Audit Logs, Reports, Settings — ১২টি সাব-মডিউল, প্রতিটির আলাদা পারমিশন ও এজ-কেস টেস্ট করতে হবে।",
    cheapRisk: "কনফ্লিক্ট-চেক ছাড়া রুটিন সেভ হওয়া, বাল্ক অপারেশনে ভুল, বা অডিট লগ অসম্পূর্ণ থাকার সমস্যা হতে পারে।",
  },
  {
    module: "স্টুডেন্ট প্যানেল — সম্পূর্ণ নতুন (UI + Backend)",
    duration: "৯–১২ দিন",
    freelancer: "১১,০০০ – ১৫,০০০ টাকা",
    agency: "৩০,০০০ – ৪০,০০০ টাকা",
    why: "Attendance, Notices, Profile, Resources, Results, Routine — সেমিস্টার-ভিত্তিক রেজাল্ট ভিউ ও রিয়েল ডেটা সংযোগ নির্ভুল হতে হবে।",
    cheapRisk: "তাড়াহুড়ায় তৈরি হলে ভুল সেমিস্টারের নম্বর দেখানো বা অ্যাটেনডেন্স ভুল ক্যালকুলেশনের ঝুঁকি থাকে।",
  },
  {
    module: "টিচার প্যানেল — সম্পূর্ণ নতুন (UI + Backend)",
    duration: "১০–১৪ দিন",
    freelancer: "১১,০০০ – ১৬,০০০ টাকা",
    agency: "৩২,০০০ – ৪৪,০০০ টাকা",
    why: "Attendance নেওয়া, Courses, Marks Entry, Resources, Routine, Profile — মার্কস এন্ট্রিতে কড়া ভ্যালিডেশন জরুরি, ভুল হলে রিপোর্ট কার্ডে সরাসরি প্রভাব পড়ে।",
    cheapRisk: "ভুল মার্কস সেভ হয়ে ভেরিফাই করার আগে ধরা না পড়লে ভুল রেজাল্ট পাবলিশ হয়ে যেতে পারে।",
  },
  {
    module: "গার্ডিয়ান প্যানেল (সম্পূর্ণ নতুন মডিউল)",
    duration: "১০–১৪ দিন",
    freelancer: "১৩,০০০ – ১৮,০০০ টাকা",
    agency: "৩৫,০০০ – ৫০,০০০ টাকা",
    why: "সন্তানের অ্যাটেনডেন্স/রেজাল্ট দেখার ড্যাশবোর্ড, মাল্টি-চাইল্ড সাপোর্ট ও সম্পর্ক ম্যাপিং, নোটিস — আগে থেকে কিছুই নেই, শুরু থেকে তৈরি করতে হবে।",
    cheapRisk: "দুর্বলভাবে করা হলে ভুল সন্তানের ডেটা দেখানো বা একাধিক অভিভাবকের অ্যাক্সেস গুলিয়ে যাওয়ার মত নিরাপত্তা ফাঁক থাকতে পারে।",
  },
  {
    module: "অ্যালামনাই প্যানেল (সম্পূর্ণ নতুন মডিউল)",
    duration: "৭–১০ দিন",
    freelancer: "৯,০০০ – ১৩,০০০ টাকা",
    agency: "২৫,০০০ – ৩৫,০০০ টাকা",
    why: "প্রাক্তন শিক্ষার্থীদের প্রোফাইল/ডিরেক্টরি, সার্টিফিকেট ভেরিফিকেশন ও নেটওয়ার্কিং তথ্য — নতুন ডেটাবেজ টেবিল ও আলাদা ভেরিফিকেশন লজিক লাগবে।",
    cheapRisk: "সার্টিফিকেট ভেরিফিকেশন লজিক দুর্বল হলে ভুয়া সার্টিফিকেট যাচাই পাস হয়ে যাওয়ার ঝুঁকি থাকে।",
  },
  {
    module: "সিকিউরিটি হার্ডেনিং (Rate limiting, SQL Injection/XSS প্রতিরোধ, HTTPS/SSL, Audit Log)",
    duration: "৭–১০ দিন",
    freelancer: "১১,০০০ – ১৫,০০০ টাকা",
    agency: "৩০,০০০ – ৪০,০০০ টাকা",
    why: "পাসওয়ার্ড হ্যাশিং, সেশন/টোকেন সিকিউরিটি, রেট-লিমিটিং ও অডিট লগ হার্ডেনিং — এটা স্কিপ করলে ছাত্র/অভিভাবকের ব্যক্তিগত তথ্য লিক বা হ্যাক হওয়ার ঝুঁকি।",
    cheapRisk: "দুর্বল সিকিউরিটিতে স্টুডেন্টদের ব্যক্তিগত তথ্য (NID, নম্বর) ফাঁস হওয়ার ঝুঁকি এবং প্রতিষ্ঠানের সুনাম নষ্ট হওয়ার সম্ভাবনা থাকে।",
  },
  {
    module: "Dockerization (ক্লায়েন্টের সার্ভারের জন্য নতুন করে)",
    duration: "২–৩ দিন",
    freelancer: "৪,০০০ – ৬,০০০ টাকা",
    agency: "১০,০০০ – ১৫,০০০ টাকা",
    why: "প্রোডাকশন-রেডি Docker ইমেজ (standalone Next.js build, non-root ইউজার) — ডিপ্লয়মেন্টকে নিরাপদ ও পুনরাবৃত্তিযোগ্য করে।",
    cheapRisk: "ভুল কনফিগারেশনে কন্টেইনার নিরাপত্তা দুর্বল থাকতে পারে বা ডিপ্লয়মেন্ট ব্যর্থ হতে পারে।",
  },
  {
    module: "Dokploy Deployment (VPS, SSL, ডোমেইন পয়েন্টিং)",
    duration: "২–৩ দিন",
    freelancer: "৫,০০০ – ৭,০০০ টাকা",
    agency: "১২,০০০ – ১৮,০০০ টাকা",
    why: "VPS-এ Dokploy ইনস্টল, অটো SSL (Let's Encrypt), রিভার্স প্রক্সি কনফিগারেশন ও ডেটাবেজ ব্যাকআপ স্ট্র্যাটেজি।",
    cheapRisk: "ভুল সার্ভার কনফিগারেশনে সাইট ডাউন হয়ে যাওয়া বা ব্যাকআপ ছাড়া ডেটা হারানোর ঝুঁকি বাড়ে।",
  },
  {
    module: "টেস্টিং, QA ও বাগ ফিক্সিং",
    duration: "৭–১০ দিন",
    freelancer: "৭,০০০ – ১১,০০০ টাকা",
    agency: "২০,০০০ – ৩০,০০০ টাকা",
    why: "প্রতিটি প্যানেল টেস্ট, ক্রস-ব্রাউজার ও মোবাইল রেসপন্সিভনেস, ইউজার অ্যাকসেপ্টেন্স টেস্টিং — লাইভ হওয়ার আগে এটাই শেষ সুরক্ষা স্তর।",
    cheapRisk: "টেস্টিং স্কিপ করলে লাইভ হওয়ার পর রিয়েল ইউজারদের সামনে বাগ ধরা পড়বে — বিশ্বাসযোগ্যতা নষ্ট হয়।",
  },
];

export default function DevCostPage() {
  const { user } = useSession();

  return (
    <RequireCapability allowed={user ? canManageUsers(user.role) : false}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="ডেভেলপমেন্ট খরচ পরিকল্পনা"
          description="প্রতিটি মডিউলের আনুমানিক খরচ, সময়, এবং কম খরচে করালে কী ঝুঁকি থাকতে পারে — এটি একটি পরিকল্পনা সহায়িকা, প্রকৃত কোটেশন ভিন্ন হতে পারে।"
        />

        <div className="rounded-lg border border-border bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <strong>দ্রষ্টব্য:</strong> "দেশি ফ্রিল্যান্সার" কলামটি বাংলাদেশের ফ্রিল্যান্স বাজারের সাধারণ রেট অনুযায়ী আনুমানিক হিসাব। "এজেন্সি/সফটওয়্যার ফার্ম" কলামটি EMIS প্রজেক্টের অফিসিয়াল ক্লায়েন্ট প্রেজেন্টেশনে (EMIS_Client_Presentation.pptx) দেওয়া বাস্তব কোটেশনের সাথে মিলিয়ে রাখা হয়েছে — সর্বমোট <strong>৪,১৪,০০০ – ৫,৮৭,০০০ টাকা</strong>। প্রকৃত খরচ কাজের সুযোগ পরিবর্তনের সাথে ওঠানামা করতে পারে।
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">মডিউল</th>
                <th className="p-3 font-medium">সময় লাগবে</th>
                <th className="p-3 font-medium">দেশি ফ্রিল্যান্সার</th>
                <th className="p-3 font-medium">এজেন্সি/সফটওয়্যার ফার্ম</th>
                <th className="p-3 font-medium">কেন এই খরচ লাগবে</th>
                <th className="p-3 font-medium">কম টাকায় করালে কী সমস্যা হতে পারে</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.module} className="border-t border-border align-top">
                  <td className="p-3 font-medium">{row.module}</td>
                  <td className="p-3 whitespace-nowrap">{row.duration}</td>
                  <td className="p-3 whitespace-nowrap">{row.freelancer}</td>
                  <td className="p-3 whitespace-nowrap">{row.agency}</td>
                  <td className="p-3">{row.why}</td>
                  <td className="p-3">{row.cheapRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border p-5 text-sm">
          <h3 className="mb-2 font-semibold">সারসংক্ষেপ</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>মোট সময়: ফ্রিল্যান্সার একা করলে প্রায় <strong>১১৬–১৬৩ দিন</strong> (৩.৯–৫.৪ মাস); এজেন্সি একাধিক লোক দিয়ে সমান্তরালে কাজ করলে প্রায় <strong>৮০–১১৫ দিন</strong>।</li>
            <li>মোট আনুমানিক খরচ (ফ্রিল্যান্সার): প্রায় <strong>১,৪৯,০০০ – ২,১৭,০০০ টাকা</strong></li>
            <li>মোট আনুমানিক খরচ (এজেন্সি/ফার্ম বা রিয়েল কোটেশন): প্রায় <strong>৪,১৪,০০০ – ৫,৮৭,০০০ টাকা</strong></li>
            <li>ফ্রিল্যান্সার সস্তা হলেও একক ব্যক্তির উপর নির্ভরশীলতা থাকে — তিনি কাজ বন্ধ করলে বা অসুস্থ হলে প্রজেক্ট আটকে যেতে পারে। এজেন্সিতে টিম/QA/সাপোর্ট থাকায় খরচ বেশি হলেও ঝুঁকি কম।</li>
            <li>যেকোনো অপশনেই লঞ্চের পর নিয়মিত <strong>মেইনটেনেন্স/সাপোর্ট</strong> খরচ আলাদাভাবে ধরে রাখা উচিত — এটি উপরের হিসাবে নেই।</li>
          </ul>
        </div>
      </div>
    </RequireCapability>
  );
}
