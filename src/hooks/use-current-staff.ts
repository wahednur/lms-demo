"use client";

import { useSession } from "@/components/shared/session-provider";
import { useAsync } from "@/hooks/use-async";
import { staffService } from "@/services";

/** Resolves the Staff record linked to the current demo session's user.
 * Meaningful for teacher/hod/academic_incharge/principal roles. */
export function useCurrentStaff() {
  const { user } = useSession();
  return useAsync(
    () => (user?.linkedStaffId ? staffService.getById(user.linkedStaffId) : Promise.resolve(null)),
    [user?.linkedStaffId],
  );
}
