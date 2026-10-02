import type { Bilingual, Role } from "@/types";

/**
 * Role ↔ permission matrix, encoded verbatim from the EMIS proposal
 * (docs/EMIS_Proposal.pdf, page 5 — "অ্যাক্সেস পারমিশন ম্যাট্রিক্স").
 *
 * This is the single source of truth for the readable permission matrix
 * shown at /admin/roles, and `can.ts` derives all concrete UI capability
 * checks from it. Do not hardcode role checks elsewhere — add a helper
 * in `can.ts` instead, so the matrix stays the one place this policy lives.
 */

export type PermissionLevel =
  | "full-access"
  | "no-access"
  | "approve"
  | "create-monitor"
  | "view-coordinate"
  | "view-only"
  | "coordinate-monitor"
  | "create-edit"
  | "view-all"
  | "monitor-verify"
  | "verify-approve"
  | "entry-edit"
  | "view-own-marks"
  | "monitor-all-dept"
  | "dept-view"
  | "class-entry"
  | "view-own"
  | "generate-review"
  | "department-report"
  | "own-class-report"
  | "own-report"
  | "final-approve"
  | "review-coordinate"
  | "verify"
  | "recommend"
  | "apply-only";

export const PERMISSION_LEVEL_LABEL: Record<PermissionLevel, Bilingual> = {
  "full-access": { en: "Full access", bn: "পূর্ণাঙ্গ অ্যাক্সেস" },
  "no-access": { en: "No access", bn: "অ্যাক্সেস নেই" },
  approve: { en: "Approve", bn: "অনুমোদন" },
  "create-monitor": { en: "Create & monitor", bn: "তৈরি ও পর্যবেক্ষণ" },
  "view-coordinate": { en: "View & coordinate", bn: "দেখা ও সমন্বয়" },
  "view-only": { en: "View only", bn: "শুধু দেখা" },
  "coordinate-monitor": { en: "Coordinate & monitor", bn: "সমন্বয় ও পর্যবেক্ষণ" },
  "create-edit": { en: "Create & edit", bn: "তৈরি ও সম্পাদনা" },
  "view-all": { en: "View all", bn: "সব দেখা" },
  "monitor-verify": { en: "Monitor & verify", bn: "পর্যবেক্ষণ ও যাচাই" },
  "verify-approve": { en: "Verify & approve", bn: "যাচাই ও অনুমোদন" },
  "entry-edit": { en: "Entry & edit", bn: "এন্ট্রি ও সম্পাদনা" },
  "view-own-marks": { en: "View own marks", bn: "নিজের নম্বর দেখা" },
  "monitor-all-dept": { en: "Monitor all departments", bn: "সকল বিভাগ পর্যবেক্ষণ" },
  "dept-view": { en: "Department view", bn: "বিভাগ দেখা" },
  "class-entry": { en: "Class entry", bn: "ক্লাস এন্ট্রি" },
  "view-own": { en: "View own", bn: "নিজেরটি দেখা" },
  "generate-review": { en: "Generate & review", bn: "তৈরি ও পর্যালোচনা" },
  "department-report": { en: "Department report", bn: "বিভাগীয় রিপোর্ট" },
  "own-class-report": { en: "Own class report", bn: "নিজ ক্লাসের রিপোর্ট" },
  "own-report": { en: "Own report", bn: "নিজের রিপোর্ট" },
  "final-approve": { en: "Final approve", bn: "চূড়ান্ত অনুমোদন" },
  "review-coordinate": { en: "Review / coordinate", bn: "পর্যালোচনা / সমন্বয়" },
  verify: { en: "Verify", bn: "যাচাই" },
  recommend: { en: "Recommend", bn: "সুপারিশ" },
  "apply-only": { en: "Apply only", bn: "শুধু আবেদন" },
};

export type MatrixFunction =
  | "system-setup"
  | "academic-calendar"
  | "course-routine-distribution"
  | "sessional-exam-marks"
  | "attendance-input"
  | "academic-reports"
  | "applications";

export const MATRIX_FUNCTION_LABEL: Record<MatrixFunction, Bilingual> = {
  "system-setup": { en: "System setup & user management", bn: "সিস্টেম সেটআপ ও ইউজার ম্যানেজমেন্ট" },
  "academic-calendar": { en: "Academic calendar & semester plan", bn: "একাডেমিক ক্যালেন্ডার ও সেমিস্টার প্ল্যান" },
  "course-routine-distribution": { en: "Course & routine distribution", bn: "কোর্স ও রুটিন ডিস্ট্রিবিউশন" },
  "sessional-exam-marks": { en: "Sessional & exam marks", bn: "সেশনাল ও পরীক্ষা নম্বর" },
  "attendance-input": { en: "Attendance input", bn: "উপস্থিতি ইনপুট" },
  "academic-reports": { en: "Academic reports", bn: "একাডেমিক রিপোর্ট" },
  applications: { en: "Applications (leave / certificate)", bn: "আবেদন (ছুটি / সনদ)" },
};

export const MATRIX_FUNCTIONS: MatrixFunction[] = [
  "system-setup",
  "academic-calendar",
  "course-routine-distribution",
  "sessional-exam-marks",
  "attendance-input",
  "academic-reports",
  "applications",
];

export const PERMISSION_MATRIX: Record<MatrixFunction, Record<Role, PermissionLevel>> = {
  "system-setup": {
    principal: "full-access",
    academic_incharge: "no-access",
    hod: "no-access",
    teacher: "no-access",
    student: "no-access",
  },
  "academic-calendar": {
    principal: "approve",
    academic_incharge: "create-monitor",
    hod: "view-coordinate",
    teacher: "view-only",
    student: "view-only",
  },
  "course-routine-distribution": {
    principal: "approve",
    academic_incharge: "coordinate-monitor",
    hod: "create-edit",
    teacher: "view-only",
    student: "view-only",
  },
  "sessional-exam-marks": {
    principal: "view-all",
    academic_incharge: "monitor-verify",
    hod: "verify-approve",
    teacher: "entry-edit",
    student: "view-own-marks",
  },
  "attendance-input": {
    principal: "view-all",
    academic_incharge: "monitor-all-dept",
    hod: "dept-view",
    teacher: "class-entry",
    student: "view-own",
  },
  "academic-reports": {
    principal: "full-access",
    academic_incharge: "generate-review",
    hod: "department-report",
    teacher: "own-class-report",
    student: "own-report",
  },
  applications: {
    principal: "final-approve",
    academic_incharge: "review-coordinate",
    hod: "verify",
    teacher: "recommend",
    student: "apply-only",
  },
};

export const ROLE_LABEL: Record<Role, Bilingual> = {
  principal: { en: "Principal", bn: "অধ্যক্ষ" },
  academic_incharge: { en: "Academic In-charge", bn: "একাডেমিক ইন-চার্জ" },
  hod: { en: "Department Head", bn: "বিভাগীয় প্রধান" },
  teacher: { en: "Teacher", bn: "শিক্ষক" },
  student: { en: "Student", bn: "শিক্ষার্থী" },
};
