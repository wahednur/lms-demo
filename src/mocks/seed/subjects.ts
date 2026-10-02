import type { Bilingual, SemesterNumber, Subject, SubjectType } from "@/types";
import { DEPARTMENTS } from "./departments";

/**
 * Subject codes (e.g. "CST-2201") are clearly fictional placeholders — the
 * source proposal did not supply official BTEB subject codes (brief §8/D).
 */

interface SubjectTemplate {
  nameEn: string;
  nameBn: string;
  type: SubjectType;
  credit: number;
}

const GENERAL_ED: Record<1 | 2, SubjectTemplate[]> = {
  1: [
    { nameEn: "Bangla", nameBn: "বাংলা", type: "theory", credit: 2 },
    { nameEn: "English I", nameBn: "ইংরেজি - ১", type: "theory", credit: 2 },
    { nameEn: "Mathematics I", nameBn: "গণিত - ১", type: "theory", credit: 3 },
    { nameEn: "Workshop Practice", nameBn: "ওয়ার্কশপ প্র্যাকটিস", type: "practical", credit: 2 },
  ],
  2: [
    { nameEn: "English II", nameBn: "ইংরেজি - ২", type: "theory", credit: 2 },
    { nameEn: "Mathematics II", nameBn: "গণিত - ২", type: "theory", credit: 3 },
    { nameEn: "Applied Physics", nameBn: "ফলিত পদার্থবিজ্ঞান", type: "both", credit: 3 },
    { nameEn: "Computer Fundamentals", nameBn: "কম্পিউটার ফান্ডামেন্টালস", type: "both", credit: 2 },
  ],
};

const DEPT_TECHNICAL: Record<string, Record<SemesterNumber, SubjectTemplate[]>> = {
  "dept-cst": {
    1: [], 2: [],
    3: [
      { nameEn: "Structured Programming", nameBn: "স্ট্রাকচার্ড প্রোগ্রামিং", type: "both", credit: 4 },
      { nameEn: "Digital Electronics", nameBn: "ডিজিটাল ইলেকট্রনিক্স", type: "both", credit: 3 },
      { nameEn: "Data Structure", nameBn: "ডাটা স্ট্রাকচার", type: "both", credit: 3 },
    ],
    4: [
      { nameEn: "Object Oriented Programming", nameBn: "অবজেক্ট ওরিয়েন্টেড প্রোগ্রামিং", type: "both", credit: 4 },
      { nameEn: "Database Management System", nameBn: "ডাটাবেজ ম্যানেজমেন্ট সিস্টেম", type: "both", credit: 4 },
      { nameEn: "Computer Networking I", nameBn: "কম্পিউটার নেটওয়ার্কিং - ১", type: "both", credit: 3 },
    ],
    5: [
      { nameEn: "Web Application Development", nameBn: "ওয়েব অ্যাপ্লিকেশন ডেভেলপমেন্ট", type: "both", credit: 4 },
      { nameEn: "Computer Networking II", nameBn: "কম্পিউটার নেটওয়ার্কিং - ২", type: "both", credit: 3 },
      { nameEn: "Operating System", nameBn: "অপারেটিং সিস্টেম", type: "both", credit: 3 },
    ],
    6: [
      { nameEn: "Software Engineering", nameBn: "সফটওয়্যার ইঞ্জিনিয়ারিং", type: "theory", credit: 3 },
      { nameEn: "Mobile Application Development", nameBn: "মোবাইল অ্যাপ্লিকেশন ডেভেলপমেন্ট", type: "both", credit: 4 },
      { nameEn: "System Analysis & Design", nameBn: "সিস্টেম অ্যানালাইসিস অ্যান্ড ডিজাইন", type: "both", credit: 3 },
    ],
    7: [
      { nameEn: "Cyber Security Fundamentals", nameBn: "সাইবার সিকিউরিটি ফান্ডামেন্টালস", type: "theory", credit: 3 },
      { nameEn: "Cloud Computing Concepts", nameBn: "ক্লাউড কম্পিউটিং কনসেপ্ট", type: "both", credit: 3 },
      { nameEn: "Project & Internship I", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ১", type: "practical", credit: 3 },
    ],
    8: [
      { nameEn: "Industrial Attachment", nameBn: "ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট", type: "practical", credit: 4 },
      { nameEn: "Project & Internship II", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ২", type: "practical", credit: 4 },
      { nameEn: "Emerging Trends in ICT", nameBn: "আইসিটি'র সাম্প্রতিক প্রবণতা", type: "theory", credit: 2 },
    ],
  },
  "dept-civil": {
    1: [], 2: [],
    3: [
      { nameEn: "Surveying I", nameBn: "সার্ভেয়িং - ১", type: "both", credit: 4 },
      { nameEn: "Building Materials", nameBn: "বিল্ডিং ম্যাটেরিয়ালস", type: "theory", credit: 3 },
      { nameEn: "Engineering Drawing", nameBn: "ইঞ্জিনিয়ারিং ড্রয়িং", type: "practical", credit: 3 },
    ],
    4: [
      { nameEn: "Surveying II", nameBn: "সার্ভেয়িং - ২", type: "both", credit: 4 },
      { nameEn: "Theory of Structures", nameBn: "থিওরি অব স্ট্রাকচার্স", type: "theory", credit: 3 },
      { nameEn: "Concrete Technology", nameBn: "কংক্রিট টেকনোলজি", type: "both", credit: 3 },
    ],
    5: [
      { nameEn: "Reinforced Concrete Design", nameBn: "রিইনফোর্সড কংক্রিট ডিজাইন", type: "both", credit: 4 },
      { nameEn: "Soil Mechanics", nameBn: "সয়েল মেকানিক্স", type: "both", credit: 3 },
      { nameEn: "Estimating & Costing I", nameBn: "এস্টিমেটিং অ্যান্ড কস্টিং - ১", type: "theory", credit: 3 },
    ],
    6: [
      { nameEn: "Steel Structure Design", nameBn: "স্টিল স্ট্রাকচার ডিজাইন", type: "theory", credit: 3 },
      { nameEn: "Highway Engineering", nameBn: "হাইওয়ে ইঞ্জিনিয়ারিং", type: "both", credit: 3 },
      { nameEn: "Estimating & Costing II", nameBn: "এস্টিমেটিং অ্যান্ড কস্টিং - ২", type: "both", credit: 3 },
    ],
    7: [
      { nameEn: "Water Supply Engineering", nameBn: "ওয়াটার সাপ্লাই ইঞ্জিনিয়ারিং", type: "theory", credit: 3 },
      { nameEn: "Construction Management", nameBn: "কনস্ট্রাকশন ম্যানেজমেন্ট", type: "theory", credit: 3 },
      { nameEn: "Project & Internship I", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ১", type: "practical", credit: 3 },
    ],
    8: [
      { nameEn: "Industrial Attachment", nameBn: "ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট", type: "practical", credit: 4 },
      { nameEn: "Project & Internship II", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ২", type: "practical", credit: 4 },
      { nameEn: "Environmental Engineering", nameBn: "এনভায়রনমেন্টাল ইঞ্জিনিয়ারিং", type: "theory", credit: 2 },
    ],
  },
  "dept-electrical": {
    1: [], 2: [],
    3: [
      { nameEn: "Electrical Circuits I", nameBn: "ইলেকট্রিক্যাল সার্কিট - ১", type: "both", credit: 4 },
      { nameEn: "Electrical Wiring & Estimating", nameBn: "ইলেকট্রিক্যাল ওয়্যারিং ও এস্টিমেটিং", type: "practical", credit: 3 },
      { nameEn: "Electronics I", nameBn: "ইলেকট্রনিক্স - ১", type: "both", credit: 3 },
    ],
    4: [
      { nameEn: "Electrical Circuits II", nameBn: "ইলেকট্রিক্যাল সার্কিট - ২", type: "both", credit: 4 },
      { nameEn: "Electrical Machine I", nameBn: "ইলেকট্রিক্যাল মেশিন - ১", type: "both", credit: 4 },
      { nameEn: "Power Plant Engineering", nameBn: "পাওয়ার প্ল্যান্ট ইঞ্জিনিয়ারিং", type: "theory", credit: 3 },
    ],
    5: [
      { nameEn: "Electrical Machine II", nameBn: "ইলেকট্রিক্যাল মেশিন - ২", type: "both", credit: 4 },
      { nameEn: "Power System I", nameBn: "পাওয়ার সিস্টেম - ১", type: "both", credit: 3 },
      { nameEn: "Industrial Electronics", nameBn: "ইন্ডাস্ট্রিয়াল ইলেকট্রনিক্স", type: "both", credit: 3 },
    ],
    6: [
      { nameEn: "Power System II", nameBn: "পাওয়ার সিস্টেম - ২", type: "theory", credit: 3 },
      { nameEn: "Industrial Automation & PLC", nameBn: "ইন্ডাস্ট্রিয়াল অটোমেশন অ্যান্ড পিএলসি", type: "both", credit: 4 },
      { nameEn: "Renewable Energy Technology", nameBn: "রিনিউয়েবল এনার্জি টেকনোলজি", type: "theory", credit: 3 },
    ],
    7: [
      { nameEn: "Electrical Machine Design", nameBn: "ইলেকট্রিক্যাল মেশিন ডিজাইন", type: "theory", credit: 3 },
      { nameEn: "Switchgear & Protection", nameBn: "সুইচগিয়ার অ্যান্ড প্রোটেকশন", type: "both", credit: 3 },
      { nameEn: "Project & Internship I", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ১", type: "practical", credit: 3 },
    ],
    8: [
      { nameEn: "Industrial Attachment", nameBn: "ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট", type: "practical", credit: 4 },
      { nameEn: "Project & Internship II", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ২", type: "practical", credit: 4 },
      { nameEn: "Electrical Estimating & Contracting", nameBn: "ইলেকট্রিক্যাল এস্টিমেটিং অ্যান্ড কন্ট্রাক্টিং", type: "theory", credit: 2 },
    ],
  },
  "dept-electronics": {
    1: [], 2: [],
    3: [
      { nameEn: "Electronic Devices & Circuits I", nameBn: "ইলেকট্রনিক ডিভাইসেস অ্যান্ড সার্কিট - ১", type: "both", credit: 4 },
      { nameEn: "Digital Electronics", nameBn: "ডিজিটাল ইলেকট্রনিক্স", type: "both", credit: 3 },
      { nameEn: "Electrical Circuits", nameBn: "ইলেকট্রিক্যাল সার্কিট", type: "both", credit: 3 },
    ],
    4: [
      { nameEn: "Electronic Devices & Circuits II", nameBn: "ইলেকট্রনিক ডিভাইসেস অ্যান্ড সার্কিট - ২", type: "both", credit: 4 },
      { nameEn: "Microprocessor & Interfacing", nameBn: "মাইক্রোপ্রসেসর অ্যান্ড ইন্টারফেসিং", type: "both", credit: 4 },
      { nameEn: "Industrial Electronics", nameBn: "ইন্ডাস্ট্রিয়াল ইলেকট্রনিক্স", type: "theory", credit: 3 },
    ],
    5: [
      { nameEn: "Communication Engineering I", nameBn: "কমিউনিকেশন ইঞ্জিনিয়ারিং - ১", type: "both", credit: 4 },
      { nameEn: "Embedded System Design", nameBn: "এমবেডেড সিস্টেম ডিজাইন", type: "both", credit: 3 },
      { nameEn: "Control System", nameBn: "কন্ট্রোল সিস্টেম", type: "theory", credit: 3 },
    ],
    6: [
      { nameEn: "Communication Engineering II", nameBn: "কমিউনিকেশন ইঞ্জিনিয়ারিং - ২", type: "theory", credit: 3 },
      { nameEn: "IoT & Sensor Technology", nameBn: "আইওটি অ্যান্ড সেন্সর টেকনোলজি", type: "both", credit: 4 },
      { nameEn: "PCB Design & Fabrication", nameBn: "পিসিবি ডিজাইন অ্যান্ড ফ্যাব্রিকেশন", type: "practical", credit: 3 },
    ],
    7: [
      { nameEn: "Mobile & Satellite Communication", nameBn: "মোবাইল অ্যান্ড স্যাটেলাইট কমিউনিকেশন", type: "theory", credit: 3 },
      { nameEn: "Biomedical Electronics", nameBn: "বায়োমেডিকেল ইলেকট্রনিক্স", type: "theory", credit: 3 },
      { nameEn: "Project & Internship I", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ১", type: "practical", credit: 3 },
    ],
    8: [
      { nameEn: "Industrial Attachment", nameBn: "ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট", type: "practical", credit: 4 },
      { nameEn: "Project & Internship II", nameBn: "প্রজেক্ট অ্যান্ড ইন্টার্নশিপ - ২", type: "practical", credit: 4 },
      { nameEn: "Emerging Trends in Electronics", nameBn: "ইলেকট্রনিক্সের সাম্প্রতিক প্রবণতা", type: "theory", credit: 2 },
    ],
  },
};

function maxMarksFor(type: SubjectType) {
  if (type === "theory") return { tc: 25, pc: 0, tf: 75, pf: 0 };
  if (type === "practical") return { tc: 0, pc: 25, tf: 0, pf: 75 };
  return { tc: 20, pc: 5, tf: 60, pf: 15 };
}

function buildSubjects(): Subject[] {
  const subjects: Subject[] = [];
  for (const dept of DEPARTMENTS) {
    for (let sem = 1 as SemesterNumber; sem <= 8; sem = (sem + 1) as SemesterNumber) {
      const templates: SubjectTemplate[] =
        sem === 1 || sem === 2
          ? GENERAL_ED[sem as 1 | 2]
          : DEPT_TECHNICAL[dept.id][sem] ?? [];
      templates.forEach((tpl, idx) => {
        const code = `${dept.code}-${sem}${String(idx + 1).padStart(2, "0")}`;
        const name: Bilingual = { en: tpl.nameEn, bn: tpl.nameBn };
        subjects.push({
          id: `sub-${dept.code.toLowerCase()}-${sem}-${idx + 1}`,
          code,
          name,
          departmentId: dept.id,
          semester: sem,
          type: tpl.type,
          credit: tpl.credit,
          maxMarks: maxMarksFor(tpl.type),
        });
      });
    }
  }
  return subjects;
}

export const SUBJECTS: Subject[] = buildSubjects();
export const SUBJECT_BY_ID: Record<string, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
);
