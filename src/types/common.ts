/**
 * Shared primitive types used across the domain model.
 *
 * Convention: every domain entity carries a stable, opaque string `id`.
 * These ids are deliberately shaped like what a future REST API would
 * return (e.g. "std-0042", "stf-0007") so the mock layer's identifiers
 * can be swapped for server-issued ones without touching UI code.
 */

export type Locale = "bn" | "en";

/** Bilingual text pair — every user-facing label that originates from data
 * (not UI chrome) should carry both so the language switch never falls
 * back to an empty string. */
export interface Bilingual {
  bn: string;
  en: string;
}

export type Shift = "1st" | "2nd";

export const SHIFTS: Shift[] = ["1st", "2nd"];

/** Semesters 1–8, matching the 4-year BTEB diploma structure. */
export type SemesterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const SEMESTERS: SemesterNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

/** Academic session, e.g. "2021-2022" — the admission-year batch label used
 * throughout BTEB polytechnics rather than a plain calendar year. */
export type SessionLabel = string;

export type ISODateString = string; // "YYYY-MM-DD"
export type ISODateTimeString = string; // full ISO timestamp

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Generic paginated result envelope — mirrors a conventional REST list
 * endpoint shape so services/api can later return the same contract. */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

/** Thrown by mock services to simulate realistic failure modes
 * (validation, conflict, not-found) with a stable `code` the UI can branch on. */
export class ServiceError extends Error {
  code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "FORBIDDEN" | "STORAGE";
  details?: Record<string, string>;

  constructor(
    code: ServiceError["code"],
    message: string,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.details = details;
  }
}
