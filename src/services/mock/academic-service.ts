import type { AcademicService } from "@/services/contracts";
import type { CourseAssignment, Subject } from "@/types";
import { storage } from "@/mocks/storage/storage";
import { DEPARTMENTS, SUBJECTS, SESSIONS, COURSE_ASSIGNMENTS, CALENDAR_EVENTS } from "@/mocks/seed";
import { delay, newId } from "@/lib/async";
import { auditService } from "./audit-service";

const SUBJECTS_KEY = "subjects-overlay"; // additions only; base SUBJECTS stay in mocks/seed
const ASSIGNMENTS_KEY = "course-assignments-overlay";

function readSubjects(): Subject[] {
  const extra = storage.read<Subject[]>(SUBJECTS_KEY, []);
  return [...SUBJECTS, ...extra];
}
function readAssignments(): CourseAssignment[] {
  const extra = storage.read<CourseAssignment[]>(ASSIGNMENTS_KEY, []);
  const removed = storage.read<string[]>(`${ASSIGNMENTS_KEY}-removed`, []);
  return [...COURSE_ASSIGNMENTS, ...extra].filter((a) => !removed.includes(a.id));
}

export const academicService: AcademicService = {
  async listDepartments() {
    await delay(150);
    return DEPARTMENTS;
  },

  async getDepartment(idOrSlug: string) {
    await delay(120);
    return DEPARTMENTS.find((d) => d.id === idOrSlug || d.slug === idOrSlug) ?? null;
  },

  async listSubjects(params = {}) {
    await delay(150);
    let items = readSubjects();
    if (params.departmentId) items = items.filter((s) => s.departmentId === params.departmentId);
    if (params.semester) items = items.filter((s) => s.semester === params.semester);
    return items;
  },

  async getSubject(id: string) {
    await delay(100);
    return readSubjects().find((s) => s.id === id) ?? null;
  },

  async listSessions() {
    await delay(100);
    return SESSIONS;
  },

  async listCourseAssignments(params = {}) {
    await delay(150);
    let items = readAssignments();
    if (params.teacherId) items = items.filter((a) => a.teacherId === params.teacherId);
    if (params.departmentId) items = items.filter((a) => a.departmentId === params.departmentId);
    if (params.semester) items = items.filter((a) => a.semester === params.semester);
    if (params.shift) items = items.filter((a) => a.shift === params.shift);
    if (params.session) items = items.filter((a) => a.session === params.session);
    return items;
  },

  async listCalendarEvents(params = {}) {
    await delay(120);
    if (params.departmentId === undefined) return CALENDAR_EVENTS;
    return CALENDAR_EVENTS.filter(
      (e) => e.departmentId === null || e.departmentId === params.departmentId,
    );
  },

  async createSubject(input, actorUserId) {
    await delay(250);
    const subject: Subject = { ...input, id: newId("sub") };
    const extra = storage.read<Subject[]>(SUBJECTS_KEY, []);
    storage.write(SUBJECTS_KEY, [...extra, subject]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "academic_incharge",
      action: "create",
      entityType: "subject",
      entityId: subject.id,
      summary: `Created subject ${subject.code} — ${subject.name.en}.`,
    });
    return subject;
  },

  async createCourseAssignment(input, actorUserId) {
    await delay(250);
    const assignment: CourseAssignment = { ...input, id: newId("ca") };
    const extra = storage.read<CourseAssignment[]>(ASSIGNMENTS_KEY, []);
    storage.write(ASSIGNMENTS_KEY, [...extra, assignment]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "update",
      entityType: "courseAssignment",
      entityId: assignment.id,
      summary: `Assigned teacher to a course for semester ${assignment.semester}.`,
    });
    return assignment;
  },

  async removeCourseAssignment(id, actorUserId) {
    await delay(200);
    const removed = storage.read<string[]>(`${ASSIGNMENTS_KEY}-removed`, []);
    storage.write(`${ASSIGNMENTS_KEY}-removed`, [...removed, id]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "update",
      entityType: "courseAssignment",
      entityId: id,
      summary: "Removed a course assignment.",
    });
  },
};
