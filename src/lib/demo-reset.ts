import { storage } from "@/mocks/storage/storage";

/** Wipes every versioned demo key so the next read falls back to the
 * original seed data — the single reset implementation used by both
 * /admin/settings and the floating demo helper (components/shared/
 * demo-helper.tsx) so there is exactly one place this logic lives. */
export function resetDemoData(): void {
  storage.resetAll();
}
