import type { Bilingual } from "./common";

/** Entry in the "Future phase" feature registry (brief §10). These are
 * explicitly NOT implemented as working functionality — concept previews
 * only, clearly labeled in the UI so the committee doesn't mistake them
 * for committed first-release scope. */
export interface FutureFeature {
  id: string;
  title: Bilingual;
  summary: Bilingual;
  category: "student-facing" | "communication" | "finance" | "infrastructure" | "mobility";
  hasPreview: boolean; // whether a concept preview page exists under /future/[id]
}
