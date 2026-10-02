export type AuditAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "activate"
  | "deactivate"
  | "promote"
  | "move-to-alumni"
  | "attendance-save"
  | "marks-draft"
  | "marks-submit"
  | "marks-return"
  | "marks-verify"
  | "marks-publish"
  | "routine-edit"
  | "report-export"
  | "reset-demo-data";

export interface AuditLogEntry {
  id: string;
  at: string; // ISO timestamp
  actorUserId: string;
  actorRoleAtTime: string;
  action: AuditAction;
  entityType: string; // "student" | "markEntry" | "attendanceRecord" | ...
  entityId: string;
  summary: string; // short human-readable description for the log table
}
