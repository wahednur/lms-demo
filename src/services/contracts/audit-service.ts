import type { AuditAction, AuditLogEntry, Page, PageParams } from "@/types";

export interface AuditLogParams extends PageParams {
  action?: AuditAction;
  actorUserId?: string;
  entityType?: string;
}

export interface AuditService {
  record(
    entry: Omit<AuditLogEntry, "id" | "at">,
  ): Promise<AuditLogEntry>;
  list(params?: AuditLogParams): Promise<Page<AuditLogEntry>>;
}
