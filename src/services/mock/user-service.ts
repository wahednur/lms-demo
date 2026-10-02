import type { UserService, UserListParams } from "@/services/contracts";
import type { Page, SystemUser } from "@/types";
import { ServiceError } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { USERS } from "@/mocks/seed";
import { delay, newId } from "@/lib/async";
import { auditService } from "./audit-service";

function readAll(): SystemUser[] {
  return storage.read(STORAGE_KEYS.users, USERS);
}
function writeAll(users: SystemUser[]) {
  storage.write(STORAGE_KEYS.users, users);
}

export const userService: UserService = {
  async list(params: UserListParams = {}) {
    await delay();
    let items = readAll();
    if (params.role) items = items.filter((u) => u.role === params.role);
    if (params.active !== undefined) items = items.filter((u) => u.active === params.active);
    if (params.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter((u) => u.name.en.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const result: Page<SystemUser> = { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
    return result;
  },

  async getById(id) {
    await delay(120);
    return readAll().find((u) => u.id === id) ?? null;
  },

  async create(input, actorUserId) {
    await delay(280);
    const users = readAll();
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new ServiceError("CONFLICT", "A user with this email already exists.");
    }
    const user: SystemUser = {
      id: newId("usr"),
      name: { bn: input.nameBn, en: input.nameEn },
      role: input.role,
      email: input.email,
      active: input.active,
      linkedStaffId: input.linkedStaffId,
      linkedStudentId: input.linkedStudentId,
      departmentId: input.departmentId,
      lastLoginAt: null,
    };
    writeAll([user, ...users]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "create",
      entityType: "user",
      entityId: user.id,
      summary: `Created user account for ${user.name.en} (${user.role.replace("_", " ")}).`,
    });
    return user;
  },

  async update(id, input, actorUserId) {
    await delay(260);
    const users = readAll();
    const existing = users.find((u) => u.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `User ${id} not found`);
    const updated: SystemUser = {
      ...existing,
      name: { bn: input.nameBn ?? existing.name.bn, en: input.nameEn ?? existing.name.en },
      role: input.role ?? existing.role,
      email: input.email ?? existing.email,
      active: input.active ?? existing.active,
      departmentId: input.departmentId !== undefined ? input.departmentId : existing.departmentId,
    };
    writeAll(users.map((u) => (u.id === id ? updated : u)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "update",
      entityType: "user",
      entityId: id,
      summary: `Updated user account for ${updated.name.en}.`,
    });
    return updated;
  },

  async setActive(id, active, actorUserId) {
    await delay(220);
    const users = readAll();
    const existing = users.find((u) => u.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `User ${id} not found`);
    const updated: SystemUser = { ...existing, active };
    writeAll(users.map((u) => (u.id === id ? updated : u)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: active ? "activate" : "deactivate",
      entityType: "user",
      entityId: id,
      summary: `${active ? "Activated" : "Deactivated"} user ${existing.name.en}.`,
    });
    return updated;
  },
};
