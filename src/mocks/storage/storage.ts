/**
 * Versioned localStorage wrapper for demo persistence.
 *
 * Every key is namespaced "emis.v{SCHEMA_VERSION}.{name}". Bumping
 * SCHEMA_VERSION automatically orphans old-shape data instead of crashing
 * on a stale/corrupted record — read() falls back to `fallback` whenever
 * JSON parsing fails, storage is unavailable (private browsing, quota,
 * disabled), or the stored value doesn't look like valid JSON.
 *
 * This is the ONLY module that touches `window.localStorage` directly.
 * Feature code and services must go through `services/mock`, never here.
 */

const SCHEMA_VERSION = 2;
const NAMESPACE = `emis.v${SCHEMA_VERSION}`;

function isStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const testKey = `${NAMESPACE}.__probe__`;
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function key(name: string): string {
  return `${NAMESPACE}.${name}`;
}

export const storage = {
  available: isStorageAvailable,

  read<T>(name: string, fallback: T): T {
    if (!isStorageAvailable()) return fallback;
    try {
      const raw = window.localStorage.getItem(key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      // Corrupted record — don't throw, just behave as if unset.
      return fallback;
    }
  },

  write<T>(name: string, value: T): boolean {
    if (!isStorageAvailable()) return false;
    try {
      window.localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch {
      // Quota exceeded or storage disabled mid-session.
      return false;
    }
  },

  remove(name: string): void {
    if (!isStorageAvailable()) return;
    try {
      window.localStorage.removeItem(key(name));
    } catch {
      // ignore
    }
  },

  /** Clears every key under this schema's namespace — used by "Reset demo
   * data". Does not touch keys from other apps or other schema versions. */
  resetAll(): void {
    if (!isStorageAvailable()) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k?.startsWith(`${NAMESPACE}.`)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  session: "session",
  students: "students",
  staff: "staff",
  attendance: "attendance",
  marks: "marks",
  examinations: "examinations",
  routine: "routine",
  notices: "notices",
  resources: "resources",
  users: "users",
  auditLog: "audit-log",
  calendarEvents: "calendar-events",
  leaveApplications: "leave-applications",
} as const;
