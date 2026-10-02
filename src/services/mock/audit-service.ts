import type { AuditService, AuditLogParams } from "@/services/contracts";
import type { AuditLogEntry, Page } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { AUDIT_LOG } from "@/mocks/seed";
import { delay, newId } from "@/lib/async";

function readAll(): AuditLogEntry[] {
  return storage.read(STORAGE_KEYS.auditLog, AUDIT_LOG);
}
function writeAll(entries: AuditLogEntry[]) {
  storage.write(STORAGE_KEYS.auditLog, entries);
}

export const auditService: AuditService = {
  async record(entry) {
    const full: AuditLogEntry = { ...entry, id: newId("aud"), at: new Date().toISOString() };
    const all = readAll();
    writeAll([full, ...all]);
    return full;
  },

  async list(params: AuditLogParams = {}) {
    await delay(150);
    let items = readAll();
    if (params.action) items = items.filter((e) => e.action === params.action);
    if (params.actorUserId) items = items.filter((e) => e.actorUserId === params.actorUserId);
    if (params.entityType) items = items.filter((e) => e.entityType === params.entityType);
    items = [...items].sort((a, b) => b.at.localeCompare(a.at));

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const result: Page<AuditLogEntry> = {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    };
    return result;
  },
};
