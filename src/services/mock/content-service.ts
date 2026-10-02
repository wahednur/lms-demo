import type { NoticeService, ResourceService, FutureFeatureService, NoticeListParams, ResourceListParams } from "@/services/contracts";
import type { Notice, Resource } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { NOTICES, RESOURCES, FUTURE_FEATURES } from "@/mocks/seed";
import { delay, newId } from "@/lib/async";
import { auditService } from "./audit-service";

function readNotices(): Notice[] {
  return storage.read(STORAGE_KEYS.notices, NOTICES);
}
function readResources(): Resource[] {
  return storage.read(STORAGE_KEYS.resources, RESOURCES);
}

export const noticeService: NoticeService = {
  async list(params: NoticeListParams = {}) {
    await delay(150);
    let items = readNotices();
    if (params.audience) items = items.filter((n) => n.audience === params.audience || n.audience === "all");
    if (params.departmentId !== undefined) {
      items = items.filter((n) => n.departmentId === null || n.departmentId === params.departmentId);
    }
    if (params.category) items = items.filter((n) => n.category === params.category);
    return [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  async getById(id) {
    await delay(100);
    return readNotices().find((n) => n.id === id) ?? null;
  },
};

export const resourceService: ResourceService = {
  async list(params: ResourceListParams = {}) {
    await delay(150);
    let items = readResources();
    if (params.subjectId) items = items.filter((r) => r.subjectId === params.subjectId);
    if (params.teacherId) items = items.filter((r) => r.teacherId === params.teacherId);
    return [...items].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  },

  async create(input, actorUserId) {
    await delay(260);
    const resource: Resource = { ...input, id: newId("res"), uploadedAt: new Date().toISOString().slice(0, 10) };
    storage.write(STORAGE_KEYS.resources, [resource, ...readResources()]);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "teacher",
      action: "create",
      entityType: "resource",
      entityId: resource.id,
      summary: `Uploaded resource "${resource.title.en}".`,
    });
    return resource;
  },
};

export const futureFeatureService: FutureFeatureService = {
  async list() {
    await delay(120);
    return FUTURE_FEATURES;
  },
  async getById(id) {
    await delay(100);
    return FUTURE_FEATURES.find((f) => f.id === id) ?? null;
  },
};
