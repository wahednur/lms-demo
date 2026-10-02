import type { CalendarEvent } from "@/types";

/** Generic, clearly-fictional calendar entries — deliberately avoids
 * asserting specific real religious-holiday dates it cannot verify. */
export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-01",
    title: { en: "5th Semester Classes Resume", bn: "৫ম সেমিস্টার ক্লাস পুনরায় শুরু" },
    type: "class-start",
    startDate: "2026-07-01",
    endDate: "2026-07-01",
    departmentId: null,
  },
  {
    id: "cal-02",
    title: { en: "Mid-Term Examination Week", bn: "মিড-টার্ম পরীক্ষা সপ্তাহ" },
    type: "exam",
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    departmentId: null,
  },
  {
    id: "cal-03",
    title: { en: "Sessional Examination — Semester 5", bn: "সেশনাল পরীক্ষা — সেমিস্টার ৫" },
    type: "exam",
    startDate: "2026-12-05",
    endDate: "2026-12-15",
    departmentId: null,
  },
  {
    id: "cal-04",
    title: { en: "Institute Foundation Day", bn: "প্রতিষ্ঠান বার্ষিকী" },
    type: "other",
    startDate: "2026-11-10",
    endDate: "2026-11-10",
    departmentId: null,
    description: {
      en: "Illustrative demo event — not a confirmed institutional date.",
      bn: "উদাহরণস্বরূপ ডেমো ইভেন্ট — এটি কোনো নিশ্চিত প্রাতিষ্ঠানিক তারিখ নয়।",
    },
  },
  {
    id: "cal-05",
    title: { en: "Winter Vacation", bn: "শীতকালীন ছুটি" },
    type: "holiday",
    startDate: "2026-12-25",
    endDate: "2027-01-01",
    departmentId: null,
  },
  {
    id: "cal-06",
    title: { en: "Semester 5 Results Expected", bn: "৫ম সেমিস্টার ফলাফল প্রত্যাশিত" },
    type: "result",
    startDate: "2027-01-10",
    endDate: "2027-01-10",
    departmentId: null,
  },
  {
    id: "cal-07",
    title: { en: "Industrial Attachment Orientation (8th Semester)", bn: "ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট ওরিয়েন্টেশন (৮ম সেমিস্টার)", },
    type: "other",
    startDate: "2026-10-05",
    endDate: "2026-10-05",
    departmentId: null,
  },
];
