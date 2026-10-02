"use client";

import { useSession } from "@/components/shared/session-provider";
import { useAsync } from "@/hooks/use-async";
import { studentService } from "@/services";

/** Resolves the Student record linked to the current demo session's user.
 * Only meaningful when the signed-in role is "student". */
export function useCurrentStudent() {
  const { user } = useSession();
  return useAsync(
    () => (user?.linkedStudentId ? studentService.getById(user.linkedStudentId) : Promise.resolve(null)),
    [user?.linkedStudentId],
  );
}
