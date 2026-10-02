import type { RoutineService, RoutineListParams } from "@/services/contracts";
import type { RoutineConflict, RoutineSlot } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { ROUTINE_SLOTS } from "@/mocks/seed";
import { rangesOverlap, type RoutineSlotFormValues } from "@/lib/validation/routine";
import { ServiceError } from "@/types";
import { delay, newId } from "@/lib/async";
import { auditService } from "./audit-service";

function readAll(): RoutineSlot[] {
  return storage.read(STORAGE_KEYS.routine, ROUTINE_SLOTS);
}
function writeAll(slots: RoutineSlot[]) {
  storage.write(STORAGE_KEYS.routine, slots);
}

function findConflicts(
  slots: RoutineSlot[],
  input: RoutineSlotFormValues,
  excludeSlotId?: string,
): RoutineConflict[] {
  const conflicts: RoutineConflict[] = [];
  for (const slot of slots) {
    if (slot.id === excludeSlotId) continue;
    if (slot.day !== input.day) continue;
    if (!rangesOverlap(slot.startTime, slot.endTime, input.startTime, input.endTime)) continue;

    if (slot.teacherId === input.teacherId) {
      conflicts.push({
        type: "teacher",
        withSlotId: slot.id,
        message: `Teacher already has a class scheduled ${slot.startTime}–${slot.endTime} on this day.`,
      });
    }
    if (slot.room === input.room) {
      conflicts.push({
        type: "room",
        withSlotId: slot.id,
        message: `Room ${slot.room} is already booked ${slot.startTime}–${slot.endTime} on this day.`,
      });
    }
    if (
      slot.departmentId === input.departmentId &&
      slot.semester === input.semester &&
      slot.shift === input.shift
    ) {
      conflicts.push({
        type: "class",
        withSlotId: slot.id,
        message: `This class already has a session scheduled ${slot.startTime}–${slot.endTime} on this day.`,
      });
    }
  }
  return conflicts;
}

export const routineService: RoutineService = {
  async listSlots(params: RoutineListParams = {}) {
    await delay(200);
    let items = readAll();
    if (params.departmentId) items = items.filter((s) => s.departmentId === params.departmentId);
    if (params.semester) items = items.filter((s) => s.semester === params.semester);
    if (params.shift) items = items.filter((s) => s.shift === params.shift);
    if (params.session) items = items.filter((s) => s.session === params.session);
    if (params.teacherId) items = items.filter((s) => s.teacherId === params.teacherId);
    if (params.room) items = items.filter((s) => s.room === params.room);
    return items;
  },

  async getTeacherRoutine(teacherId, session) {
    await delay(180);
    let items = readAll().filter((s) => s.teacherId === teacherId);
    if (session) items = items.filter((s) => s.session === session);
    return items;
  },

  async checkConflicts(input, excludeSlotId) {
    await delay(150);
    return findConflicts(readAll(), input, excludeSlotId);
  },

  async createSlot(input, actorUserId) {
    await delay(300);
    const slots = readAll();
    const conflicts = findConflicts(slots, input);
    if (conflicts.length > 0) {
      // The slot form should call checkConflicts() live and block submission
      // before reaching here — this is a defensive last line of defence.
      throw new ServiceError("CONFLICT", conflicts[0].message);
    }
    const slot: RoutineSlot = { ...input, id: newId("rt") };
    writeAll([slot, ...slots]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "routine-edit",
      entityType: "routineSlot",
      entityId: slot.id,
      summary: `Added a ${slot.kind} routine slot (${slot.day}, ${slot.startTime}–${slot.endTime}).`,
    });
    return slot;
  },

  async updateSlot(id, input, actorUserId) {
    await delay(280);
    const slots = readAll();
    const conflicts = findConflicts(slots, input, id);
    if (conflicts.length > 0) {
      throw new ServiceError("CONFLICT", conflicts[0].message);
    }
    const updated: RoutineSlot = { ...input, id };
    writeAll(slots.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "routine-edit",
      entityType: "routineSlot",
      entityId: id,
      summary: `Updated routine slot (${updated.day}, ${updated.startTime}–${updated.endTime}).`,
    });
    return updated;
  },

  async deleteSlot(id, actorUserId) {
    await delay(220);
    const slots = readAll();
    writeAll(slots.filter((s) => s.id !== id));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "routine-edit",
      entityType: "routineSlot",
      entityId: id,
      summary: "Removed a routine slot.",
    });
  },
};
