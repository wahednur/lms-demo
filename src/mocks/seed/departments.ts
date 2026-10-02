import type { Department } from "@/types";

export const DEPARTMENTS: Department[] = [
  {
    id: "dept-cst",
    code: "CST",
    name: { bn: "কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি", en: "Computer Science & Technology" },
    slug: "computer-science-technology",
    shifts: ["1st", "2nd"],
    description: {
      bn: "সফটওয়্যার, নেটওয়ার্কিং ও হার্ডওয়্যার বিষয়ে চার বছর মেয়াদী ডিপ্লোমা ইঞ্জিনিয়ারিং প্রোগ্রাম।",
      en: "Four-year diploma-in-engineering program covering software, networking, and hardware fundamentals.",
    },
    establishedYear: 1996,
    headOfDepartment: { "1st": "stf-0002", "2nd": "stf-0003" },
  },
  {
    id: "dept-civil",
    code: "CIVIL",
    name: { bn: "সিভিল টেকনোলজি", en: "Civil Technology" },
    slug: "civil-technology",
    shifts: ["1st", "2nd"],
    description: {
      bn: "স্থাপনা নির্মাণ, সার্ভে ও কাঠামোগত ডিজাইন বিষয়ে ডিপ্লোমা ইঞ্জিনিয়ারিং প্রোগ্রাম।",
      en: "Diploma program focused on construction, surveying, and structural design practice.",
    },
    establishedYear: 1988,
    headOfDepartment: { "1st": "stf-0006", "2nd": "stf-0005" },
  },
  {
    id: "dept-electrical",
    code: "EL",
    name: { bn: "ইলেকট্রিক্যাল টেকনোলজি", en: "Electrical Technology" },
    slug: "electrical-technology",
    shifts: ["1st", "2nd"],
    description: {
      bn: "বিদ্যুৎ উৎপাদন, বিতরণ ও স্থাপনা রক্ষণাবেক্ষণ বিষয়ে ডিপ্লোমা ইঞ্জিনিয়ারিং প্রোগ্রাম।",
      en: "Diploma program covering power generation, distribution, and installation maintenance.",
    },
    establishedYear: 1988,
    headOfDepartment: { "1st": "stf-0007", "2nd": "stf-0008" },
  },
  {
    id: "dept-electronics",
    code: "ETE",
    name: { bn: "ইলেকট্রনিক্স টেকনোলজি", en: "Electronics Technology" },
    slug: "electronics-technology",
    shifts: ["1st", "2nd"],
    description: {
      bn: "ইলেকট্রনিক সার্কিট, যোগাযোগ ও নিয়ন্ত্রণ ব্যবস্থা বিষয়ে ডিপ্লোমা ইঞ্জিনিয়ারিং প্রোগ্রাম।",
      en: "Diploma program spanning electronic circuits, communication, and control systems.",
    },
    establishedYear: 2001,
    headOfDepartment: { "1st": "stf-0009", "2nd": "stf-0010" },
  },
];

export const DEPARTMENT_BY_ID: Record<string, Department> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, d]),
);
