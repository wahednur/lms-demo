import type { AcademicSession, SemesterNumber } from "@/types";

export const SESSIONS: AcademicSession[] = [
  { label: "2021-2022", startYear: 2021, isActive: false },
  { label: "2022-2023", startYear: 2022, isActive: false },
  { label: "2023-2024", startYear: 2023, isActive: false },
  { label: "2024-2025", startYear: 2024, isActive: false },
  { label: "2025-2026", startYear: 2025, isActive: true },
];

/** Maps a semester pair to the session label that batch is currently in,
 * given "today" ≈ Oct 2026 in the demo's fictional timeline. Two
 * semesters share one admission session, matching BTEB's ~6-month terms. */
export const SEMESTER_TO_SESSION: Record<SemesterNumber, string> = {
  1: "2025-2026",
  2: "2025-2026",
  3: "2024-2025",
  4: "2024-2025",
  5: "2023-2024",
  6: "2023-2024",
  7: "2022-2023",
  8: "2022-2023",
};

export const ALUMNI_SESSION = "2021-2022";

/**
 * Given a student's own current (semester, session), returns the session
 * label for one of their earlier completed semesters — anchored to that
 * student's personal timeline (semester pairs step back one year each),
 * not the global SEMESTER_TO_SESSION cohort table (which only answers
 * "which currently-admitted batch sits at semester N right now" and is
 * unsuitable for one student's own backward history).
 */
export function priorSession(
  currentSession: string,
  currentSemester: SemesterNumber,
  targetSemester: SemesterNumber,
): string {
  const startYear = Number(currentSession.split("-")[0]);
  const pairIndex = (sem: SemesterNumber) => Math.floor((sem - 1) / 2);
  const yearsBack = pairIndex(currentSemester) - pairIndex(targetSemester);
  const y = startYear - yearsBack;
  return `${y}-${y + 1}`;
}
