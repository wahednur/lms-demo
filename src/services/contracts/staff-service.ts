import type { Designation, Page, PageParams, Staff, TrainingRecord } from "@/types";
import type { StaffFormValues } from "@/lib/validation/staff";

export interface StaffListParams extends PageParams {
  departmentId?: string | null;
  designation?: Designation;
  status?: "active" | "inactive";
}

export interface StaffService {
  list(params?: StaffListParams): Promise<Page<Staff>>;
  getById(id: string): Promise<Staff | null>;
  create(input: StaffFormValues, actorUserId: string): Promise<Staff>;
  update(id: string, input: Partial<StaffFormValues>, actorUserId: string): Promise<Staff>;
  setStatus(id: string, status: "active" | "inactive", actorUserId: string): Promise<Staff>;
  addTraining(id: string, training: Omit<TrainingRecord, "id">, actorUserId: string): Promise<Staff>;
}
