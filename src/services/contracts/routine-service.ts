import type { RoutineConflict, RoutineSlot, SemesterNumber, Shift } from "@/types";
import type { RoutineSlotFormValues } from "@/lib/validation/routine";

export interface RoutineListParams {
  departmentId?: string;
  semester?: SemesterNumber;
  shift?: Shift;
  session?: string;
  teacherId?: string;
  room?: string;
}

export interface RoutineService {
  listSlots(params?: RoutineListParams): Promise<RoutineSlot[]>;
  getTeacherRoutine(teacherId: string, session?: string): Promise<RoutineSlot[]>;
  /** Pure check, no write — used for live validation in the slot form before save. */
  checkConflicts(input: RoutineSlotFormValues, excludeSlotId?: string): Promise<RoutineConflict[]>;
  createSlot(input: RoutineSlotFormValues, actorUserId: string): Promise<RoutineSlot>;
  updateSlot(id: string, input: RoutineSlotFormValues, actorUserId: string): Promise<RoutineSlot>;
  deleteSlot(id: string, actorUserId: string): Promise<void>;
}
