import type { AuditLogEntry } from "@/types";

/** Plausible pre-existing activity history so /admin/audit-logs isn't empty
 * before the presenter performs any live action in the demo. */
export const AUDIT_LOG: AuditLogEntry[] = [
  { id: "aud-01", at: "2026-09-30T08:10:00.000Z", actorUserId: "usr-0001", actorRoleAtTime: "principal", action: "login", entityType: "session", entityId: "usr-0001", summary: "Principal logged in." },
  { id: "aud-02", at: "2026-09-29T09:05:00.000Z", actorUserId: "usr-0011", actorRoleAtTime: "teacher", action: "attendance-save", entityType: "attendanceRecord", entityId: "att-120", summary: "Saved attendance for Computer Networking II, semester 5." },
  { id: "aud-03", at: "2026-09-28T11:40:00.000Z", actorUserId: "usr-0002", actorRoleAtTime: "hod", action: "marks-verify", entityType: "markEntry", entityId: "mk-batch", summary: "Verified Computer Networking II sessional marks for semester 5." },
  { id: "aud-04", at: "2026-09-27T14:20:00.000Z", actorUserId: "usr-0013", actorRoleAtTime: "teacher", action: "marks-submit", entityType: "markEntry", entityId: "mk-batch", summary: "Submitted Civil Technology semester 5 marks for verification." },
  { id: "aud-05", at: "2026-09-27T14:45:00.000Z", actorUserId: "usr-0006", actorRoleAtTime: "hod", action: "marks-return", entityType: "markEntry", entityId: "mk-batch", summary: "Returned one semester 5 mark entry for correction." },
  { id: "aud-06", at: "2026-09-25T10:00:00.000Z", actorUserId: "usr-0004", actorRoleAtTime: "academic_incharge", action: "report-export", entityType: "report", entityId: "attendance-report", summary: "Exported institute-wide attendance report (CSV)." },
  { id: "aud-07", at: "2026-09-24T09:30:00.000Z", actorUserId: "usr-0002", actorRoleAtTime: "hod", action: "routine-edit", entityType: "routineSlot", entityId: "rt-14", summary: "Updated a Computer Science & Technology routine slot." },
  { id: "aud-08", at: "2026-09-22T16:00:00.000Z", actorUserId: "usr-0001", actorRoleAtTime: "principal", action: "activate", entityType: "staff", entityId: "stf-0018", summary: "Activated a staff account." },
  { id: "aud-09", at: "2026-09-20T13:10:00.000Z", actorUserId: "usr-0004", actorRoleAtTime: "academic_incharge", action: "update", entityType: "calendarEvent", entityId: "cal-03", summary: "Updated the semester 5 sessional examination schedule." },
  { id: "aud-10", at: "2026-09-18T08:50:00.000Z", actorUserId: "usr-0001", actorRoleAtTime: "principal", action: "create", entityType: "user", entityId: "usr-0018", summary: "Created a new staff user account." },
  { id: "aud-11", at: "2026-09-15T12:00:00.000Z", actorUserId: "usr-0019", actorRoleAtTime: "staff", action: "update", entityType: "student", entityId: "std-0003", summary: "Updated guardian contact information." },
  { id: "aud-12", at: "2026-09-10T09:15:00.000Z", actorUserId: "usr-0002", actorRoleAtTime: "hod", action: "attendance-save", entityType: "attendanceRecord", entityId: "att-80", summary: "Saved attendance for Operating System, semester 5." },
  { id: "aud-13", at: "2026-09-05T15:30:00.000Z", actorUserId: "usr-0001", actorRoleAtTime: "principal", action: "marks-publish", entityType: "examination", entityId: "exam-9", summary: "Published semester 3 final results for Computer Science & Technology." },
  { id: "aud-14", at: "2026-08-30T10:00:00.000Z", actorUserId: "usr-0004", actorRoleAtTime: "academic_incharge", action: "report-export", entityType: "report", entityId: "result-report", summary: "Exported semester 3 result report (CSV)." },
  { id: "aud-15", at: "2026-08-25T11:00:00.000Z", actorUserId: "usr-0001", actorRoleAtTime: "principal", action: "login", entityType: "session", entityId: "usr-0001", summary: "Principal logged in." },
  { id: "aud-16", at: "2026-08-20T09:00:00.000Z", actorUserId: "usr-0001", actorRoleAtTime: "principal", action: "create", entityType: "student", entityId: "std-0001", summary: "Registered a new 1st semester student." },
  { id: "aud-17", at: "2026-08-10T09:00:00.000Z", actorUserId: "usr-0004", actorRoleAtTime: "academic_incharge", action: "update", entityType: "courseAssignment", entityId: "ca-1", summary: "Coordinated teacher-subject distribution for the new session." },
];
