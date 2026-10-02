import type { LetterGrade, MarkEntry, SemesterResult, Subject, SubjectResult } from "@/types";

/**
 * ============================================================================
 * ILLUSTRATIVE GRADING UTILITY — NOT A VERIFIED BTEB IMPLEMENTATION
 * ============================================================================
 * The source proposal (docs/EMIS_Proposal.pdf) names TC/PC/TF/PF, Grade, and
 * GPA/CGPA as fields the system must handle, but does not supply the
 * official Bangladesh Technical Education Board (BTEB) mark boundaries,
 * grading formula, or promotion rules.
 *
 * Everything in this file is a clearly-labeled, self-contained, swappable
 * demonstration scale — good enough to show the *workflow* (entry → verify →
 * publish → GPA/CGPA display) without asserting it matches BTEB's actual
 * policy. Before any real deployment this entire file must be replaced with
 * values confirmed against the current official BTEB marking guide.
 *
 * Every place this module is used in the UI should surface
 * `GRADE_DISCLAIMER` near the grade/GPA so viewers don't mistake the demo
 * scale for an authoritative one.
 * ============================================================================
 */

export const GRADE_DISCLAIMER = {
  en: "Illustrative grading scale for demonstration only — not verified against official BTEB rules.",
  bn: "শুধুমাত্র প্রদর্শনের জন্য একটি উদাহরণস্বরূপ গ্রেডিং স্কেল — সরকারি বিটিইবি নিয়মের সাথে যাচাইকৃত নয়।",
};

interface GradeBand {
  minPercent: number;
  grade: LetterGrade;
  point: number;
}

/** Configurable demo scale — change freely, nothing else in the app assumes
 * these exact numbers (everything reads through gradeFromPercent). */
export const ILLUSTRATIVE_GRADE_SCALE: GradeBand[] = [
  { minPercent: 80, grade: "A+", point: 4.0 },
  { minPercent: 75, grade: "A", point: 3.75 },
  { minPercent: 70, grade: "A-", point: 3.5 },
  { minPercent: 60, grade: "B", point: 3.0 },
  { minPercent: 50, grade: "C", point: 2.5 },
  { minPercent: 40, grade: "D", point: 2.0 },
  { minPercent: 0, grade: "F", point: 0.0 },
];

export function gradeFromPercent(percent: number): { grade: LetterGrade; point: number } {
  const band =
    ILLUSTRATIVE_GRADE_SCALE.find((b) => percent >= b.minPercent) ??
    ILLUSTRATIVE_GRADE_SCALE[ILLUSTRATIVE_GRADE_SCALE.length - 1];
  return { grade: band.grade, point: band.point };
}

/** Sums only the components a subject actually uses (a theory-only subject
 * has no pc/pf; maxMarks reflects that), then grades on the percentage. */
export function computeSubjectResult(mark: MarkEntry, subject: Subject): SubjectResult {
  const maxTotal =
    subject.maxMarks.tc + subject.maxMarks.pc + subject.maxMarks.tf + subject.maxMarks.pf;
  const total = (mark.tc ?? 0) + (mark.pc ?? 0) + (mark.tf ?? 0) + (mark.pf ?? 0);
  const percent = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const { grade, point } = gradeFromPercent(percent);
  return { subjectId: subject.id, totalMarks: total, grade, gradePoint: point };
}

/** Demo rule: a single failed subject zeroes the semester GPA (a common but
 * NOT universally-verified BTEB-style convention) — isolated here so it can
 * be toggled without touching callers. */
export function computeGpa(subjects: SubjectResult[]): { gpa: number; hasFail: boolean } {
  if (subjects.length === 0) return { gpa: 0, hasFail: false };
  const hasFail = subjects.some((s) => s.grade === "F");
  if (hasFail) return { gpa: 0, hasFail: true };
  const avg = subjects.reduce((sum, s) => sum + s.gradePoint, 0) / subjects.length;
  return { gpa: Math.round(avg * 100) / 100, hasFail: false };
}

export function computeCgpa(priorResults: SemesterResult[]): number | null {
  const counted = priorResults.filter((r) => r.publishedAt);
  if (counted.length === 0) return null;
  const avg = counted.reduce((sum, r) => sum + r.gpa, 0) / counted.length;
  return Math.round(avg * 100) / 100;
}
