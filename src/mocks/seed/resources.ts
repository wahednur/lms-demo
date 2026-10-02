import type { Resource } from "@/types";
import { HERO_SUBJECTS } from "./examinations";
import { SUBJECTS } from "./subjects";
import { COURSE_ASSIGNMENTS } from "./course-assignments";

/** Fictional filenames only — brief §9: no real file is stored or
 * downloadable, the "Download" action in the UI must say so plainly. */
function teacherOf(subjectId: string): string {
  return COURSE_ASSIGNMENTS.find((a) => a.subjectId === subjectId)?.teacherId ?? "stf-0002";
}

const RESOURCE_TEMPLATES: { subjectId: string; title: { en: string; bn: string }; type: Resource["type"]; fileName: string; sizeKb: number }[] = [
  { subjectId: HERO_SUBJECTS.webAppDev.id, title: { en: "Lecture 1 — Intro to Web Frameworks", bn: "লেকচার ১ — ওয়েব ফ্রেমওয়ার্ক পরিচিতি" }, type: "lecture-note", fileName: "web-app-dev-lecture-01.pdf", sizeKb: 842 },
  { subjectId: HERO_SUBJECTS.webAppDev.id, title: { en: "Assignment 1 — Build a Static Page", bn: "অ্যাসাইনমেন্ট ১ — স্ট্যাটিক পেজ তৈরি" }, type: "assignment", fileName: "web-app-dev-assignment-01.pdf", sizeKb: 210 },
  { subjectId: HERO_SUBJECTS.networking2.id, title: { en: "Syllabus — Computer Networking II", bn: "সিলেবাস — কম্পিউটার নেটওয়ার্কিং ২" }, type: "syllabus", fileName: "networking-2-syllabus.pdf", sizeKb: 150 },
  { subjectId: HERO_SUBJECTS.networking2.id, title: { en: "Lecture 4 — Routing Protocols", bn: "লেকচার ৪ — রাউটিং প্রোটোকল" }, type: "lecture-note", fileName: "networking-2-lecture-04.pdf", sizeKb: 965 },
  { subjectId: HERO_SUBJECTS.operatingSystem.id, title: { en: "Lecture 2 — Process Scheduling", bn: "লেকচার ২ — প্রসেস শিডিউলিং" }, type: "lecture-note", fileName: "os-lecture-02.pdf", sizeKb: 720 },
  { subjectId: HERO_SUBJECTS.operatingSystem.id, title: { en: "Assignment 2 — Scheduling Algorithms", bn: "অ্যাসাইনমেন্ট ২ — শিডিউলিং অ্যালগরিদম" }, type: "assignment", fileName: "os-assignment-02.pdf", sizeKb: 180 },
];

// A handful more spread across other departments so /portal/*/resources
// doesn't look empty outside the hero cell.
const extraSubjects = SUBJECTS.filter((s) =>
  ["dept-civil", "dept-electrical", "dept-electronics"].includes(s.departmentId) && s.semester === 5,
).slice(0, 6);

for (const subject of extraSubjects) {
  RESOURCE_TEMPLATES.push({
    subjectId: subject.id,
    title: { en: `Syllabus — ${subject.name.en}`, bn: `সিলেবাস — ${subject.name.bn}` },
    type: "syllabus",
    fileName: `${subject.code.toLowerCase()}-syllabus.pdf`,
    sizeKb: 140,
  });
  RESOURCE_TEMPLATES.push({
    subjectId: subject.id,
    title: { en: `Lecture 1 — ${subject.name.en}`, bn: `লেকচার ১ — ${subject.name.bn}` },
    type: "lecture-note",
    fileName: `${subject.code.toLowerCase()}-lecture-01.pdf`,
    sizeKb: 610,
  });
}

export const RESOURCES: Resource[] = RESOURCE_TEMPLATES.map((tpl, idx) => ({
  id: `res-${idx + 1}`,
  title: tpl.title,
  type: tpl.type,
  subjectId: tpl.subjectId,
  teacherId: teacherOf(tpl.subjectId),
  uploadedAt: "2026-09-12",
  fileName: tpl.fileName,
  fileSizeKb: tpl.sizeKb,
}));
