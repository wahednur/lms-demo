import type { Bilingual, Shift } from "./common";

/** A technology/trade department (e.g. Computer Science & Technology). */
export interface Department {
  id: string;
  code: string; // short code, e.g. "CST"
  name: Bilingual;
  slug: string;
  shifts: Shift[];
  description: Bilingual;
  /** Fictional establishment year, for the department directory page. */
  establishedYear: number;
  headOfDepartment: Record<Shift, string | null>; // staff id per shift
}
