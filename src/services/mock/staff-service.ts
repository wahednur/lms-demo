import type { StaffService, StaffListParams } from "@/services/contracts";
import type { Page, Staff } from "@/types";
import { ServiceError } from "@/types";
import type { StaffFormValues } from "@/lib/validation/staff";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { STAFF } from "@/mocks/seed";
import { delay, newId } from "@/lib/async";
import { auditService } from "./audit-service";

function readAll(): Staff[] {
  return storage.read(STORAGE_KEYS.staff, STAFF);
}
function writeAll(staff: Staff[]) {
  storage.write(STORAGE_KEYS.staff, staff);
}
function initialsOf(nameEn: string): string {
  return nameEn.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function formToStaff(input: StaffFormValues, existing?: Staff): Staff {
  return {
    id: existing?.id ?? newId("stf"),
    name: { bn: input.nameBn, en: input.nameEn },
    photoInitials: initialsOf(input.nameEn),
    designation: input.designation,
    departmentId: input.departmentId,
    shift: input.shift,
    isDepartmentHead: existing?.isDepartmentHead ?? false,
    staffRole: existing?.staffRole ?? "teacher",
    phone: input.phone,
    email: input.email,
    joiningDate: input.joiningDate,
    status: input.status,
    trainings: existing?.trainings ?? [],
    nidLast4: existing?.nidLast4 ?? "0000",
  };
}

export const staffService: StaffService = {
  async list(params: StaffListParams = {}) {
    await delay();
    let items = readAll();
    if (params.departmentId !== undefined) items = items.filter((s) => s.departmentId === params.departmentId);
    if (params.designation) items = items.filter((s) => s.designation === params.designation);
    if (params.status) items = items.filter((s) => s.status === params.status);
    if (params.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter((s) => s.name.en.toLowerCase().includes(q) || s.name.bn.includes(q));
    }
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const result: Page<Staff> = { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
    return result;
  },

  async getById(id) {
    await delay(150);
    return readAll().find((s) => s.id === id) ?? null;
  },

  async create(input, actorUserId) {
    await delay(300);
    const staff = formToStaff(input);
    writeAll([staff, ...readAll()]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "create",
      entityType: "staff",
      entityId: staff.id,
      summary: `Added new staff member ${staff.name.en}.`,
    });
    return staff;
  },

  async update(id, input, actorUserId) {
    await delay(280);
    const all = readAll();
    const existing = all.find((s) => s.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `Staff ${id} not found`);
    const merged: StaffFormValues = {
      nameBn: input.nameBn ?? existing.name.bn,
      nameEn: input.nameEn ?? existing.name.en,
      designation: input.designation ?? existing.designation,
      departmentId: input.departmentId !== undefined ? input.departmentId : existing.departmentId,
      shift: input.shift !== undefined ? input.shift : existing.shift,
      phone: input.phone ?? existing.phone,
      email: input.email ?? existing.email,
      joiningDate: input.joiningDate ?? existing.joiningDate,
      status: input.status ?? existing.status,
    };
    const updated = formToStaff(merged, existing);
    writeAll(all.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "update",
      entityType: "staff",
      entityId: id,
      summary: `Updated staff profile for ${updated.name.en}.`,
    });
    return updated;
  },

  async setStatus(id, status, actorUserId) {
    await delay(220);
    const all = readAll();
    const existing = all.find((s) => s.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `Staff ${id} not found`);
    const updated: Staff = { ...existing, status };
    writeAll(all.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: status === "active" ? "activate" : "deactivate",
      entityType: "staff",
      entityId: id,
      summary: `${status === "active" ? "Activated" : "Deactivated"} ${existing.name.en}.`,
    });
    return updated;
  },

  async addTraining(id, training, actorUserId) {
    await delay(250);
    const all = readAll();
    const existing = all.find((s) => s.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `Staff ${id} not found`);
    const updated: Staff = { ...existing, trainings: [{ ...training, id: newId("tr") }, ...existing.trainings] };
    writeAll(all.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "update",
      entityType: "staff",
      entityId: id,
      summary: `Added training record for ${existing.name.en}.`,
    });
    return updated;
  },
};
