import type { FutureFeature } from "@/types";

/** Registry for brief §10 — explicitly NOT committed first-release
 * functionality. Rendered under /future as labeled concept previews only. */
export const FUTURE_FEATURES: FutureFeature[] = [
  {
    id: "online-admission",
    title: { en: "Online Student Admission", bn: "অনলাইন শিক্ষার্থী ভর্তি" },
    summary: {
      en: "Prospective students apply and are provisionally seated online instead of in person.",
      bn: "ভবিষ্যৎ শিক্ষার্থীরা সরাসরি উপস্থিত না হয়ে অনলাইনে আবেদন ও আসন নিশ্চিত করতে পারবে।",
    },
    category: "student-facing",
    hasPreview: true,
  },
  {
    id: "online-application",
    title: { en: "Online Application (Leave / Transcript)", bn: "অনলাইন আবেদন (ছুটি / ট্রান্সক্রিপ্ট)" },
    summary: {
      en: "Students and teachers submit leave, transcript, and certificate requests through the portal with tracked status.",
      bn: "শিক্ষার্থী ও শিক্ষকরা পোর্টালের মাধ্যমে ছুটি, ট্রান্সক্রিপ্ট ও সনদের আবেদন করতে পারবে এবং অগ্রগতি দেখতে পারবে।",
    },
    category: "student-facing",
    hasPreview: true,
  },
  {
    id: "fee-management",
    title: { en: "Online Fee Management & Payment", bn: "অনলাইন ফি ব্যবস্থাপনা ও পরিশোধ" },
    summary: {
      en: "Semester and exam fees paid through an online gateway with digital receipts.",
      bn: "সেমিস্টার ও পরীক্ষার ফি অনলাইন গেটওয়ের মাধ্যমে পরিশোধ এবং ডিজিটাল রসিদ প্রদান।",
    },
    category: "finance",
    hasPreview: true,
  },
  {
    id: "sms-email-notification",
    title: { en: "SMS & Email Notifications", bn: "এসএমএস ও ইমেইল নোটিফিকেশন" },
    summary: {
      en: "Attendance, result, and notice alerts delivered automatically to students and guardians.",
      bn: "উপস্থিতি, ফলাফল ও নোটিশ সংক্রান্ত সতর্কবার্তা শিক্ষার্থী ও অভিভাবকদের কাছে স্বয়ংক্রিয়ভাবে পৌঁছে দেওয়া।",
    },
    category: "communication",
    hasPreview: true,
  },
  {
    id: "digital-id-card",
    title: { en: "Digital ID Card", bn: "ডিজিটাল আইডি কার্ড" },
    summary: {
      en: "A verifiable digital student/staff ID card generated from EMIS records.",
      bn: "ইএমআইএস তথ্যের ভিত্তিতে শিক্ষার্থী/কর্মচারীদের জন্য যাচাইযোগ্য ডিজিটাল আইডি কার্ড তৈরি।",
    },
    category: "student-facing",
    hasPreview: true,
  },
  {
    id: "certificate-verification",
    title: { en: "Online Certificate / Document Verification", bn: "অনলাইন সনদ/ডকুমেন্ট যাচাইকরণ" },
    summary: {
      en: "Third parties verify the authenticity of an issued certificate or transcript online.",
      bn: "তৃতীয় পক্ষ অনলাইনে প্রদত্ত সনদ বা ট্রান্সক্রিপ্টের সত্যতা যাচাই করতে পারবে।",
    },
    category: "student-facing",
    hasPreview: false,
  },
  {
    id: "mobile-application",
    title: { en: "Mobile Application", bn: "মোবাইল অ্যাপ্লিকেশন" },
    summary: {
      en: "A companion mobile app mirroring the student/teacher portal for on-the-go access.",
      bn: "চলতি পথে ব্যবহারের জন্য শিক্ষার্থী/শিক্ষক পোর্টালের একটি সহযোগী মোবাইল অ্যাপ।",
    },
    category: "mobility",
    hasPreview: false,
  },
  {
    id: "industrial-attachment-tracking",
    title: { en: "Industrial Attachment Tracking", bn: "ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট ট্র্যাকিং" },
    summary: {
      en: "Placement, attendance, and evaluation tracking for 8th-semester industrial attachment.",
      bn: "৮ম সেমিস্টারের ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্টের জন্য প্লেসমেন্ট, উপস্থিতি ও মূল্যায়ন ট্র্যাকিং।",
    },
    category: "student-facing",
    hasPreview: true,
  },
  {
    id: "lab-inventory",
    title: { en: "Lab / Workshop Inventory", bn: "ল্যাব/ওয়ার্কশপ ইনভেন্টরি" },
    summary: {
      en: "Digital stock tracking for lab equipment, chemicals, and workshop tools per department.",
      bn: "বিভাগভিত্তিক ল্যাব সরঞ্জাম, রাসায়নিক দ্রব্য ও ওয়ার্কশপ যন্ত্রাংশের ডিজিটাল স্টক ট্র্যাকিং।",
    },
    category: "infrastructure",
    hasPreview: true,
  },
];
