import type { Page, PageParams, Role, SystemUser } from "@/types";
import type { UserFormValues } from "@/lib/validation/user";

export interface UserListParams extends PageParams {
  role?: Role;
  active?: boolean;
}

export interface UserService {
  list(params?: UserListParams): Promise<Page<SystemUser>>;
  getById(id: string): Promise<SystemUser | null>;
  create(input: UserFormValues, actorUserId: string): Promise<SystemUser>;
  update(id: string, input: Partial<UserFormValues>, actorUserId: string): Promise<SystemUser>;
  setActive(id: string, active: boolean, actorUserId: string): Promise<SystemUser>;
}
