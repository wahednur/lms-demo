import type { Bilingual } from "./common";

export type NoticeAudience = "all" | "students" | "teachers" | "department";

export type NoticeCategory =
  | "academic"
  | "examination"
  | "administrative"
  | "event"
  | "holiday";

export interface Notice {
  id: string;
  title: Bilingual;
  body: Bilingual;
  category: NoticeCategory;
  audience: NoticeAudience;
  departmentId: string | null;
  publishedAt: string; // ISO date
  publishedByUserId: string;
  /** All seed notices are fictional demonstration content — surfaced in the UI. */
  isDemoContent: true;
}

export type ResourceType = "lecture-note" | "assignment" | "syllabus" | "other";

export interface Resource {
  id: string;
  title: Bilingual;
  type: ResourceType;
  subjectId: string;
  teacherId: string;
  uploadedAt: string;
  /** Fictional filename only — no real file is stored or downloadable. */
  fileName: string;
  fileSizeKb: number;
}
