import type { FutureFeature, Notice, NoticeAudience, Resource } from "@/types";

export interface NoticeListParams {
  audience?: NoticeAudience;
  departmentId?: string | null;
  category?: Notice["category"];
}

export interface NoticeService {
  list(params?: NoticeListParams): Promise<Notice[]>;
  getById(id: string): Promise<Notice | null>;
}

export interface ResourceListParams {
  subjectId?: string;
  teacherId?: string;
}

export interface ResourceService {
  list(params?: ResourceListParams): Promise<Resource[]>;
  create(
    input: Omit<Resource, "id" | "uploadedAt">,
    actorUserId: string,
  ): Promise<Resource>;
}

/** Read-only registry — brief §10: future-phase features are previewed,
 * never implemented as working functionality, so there is no mutation API. */
export interface FutureFeatureService {
  list(): Promise<FutureFeature[]>;
  getById(id: string): Promise<FutureFeature | null>;
}
