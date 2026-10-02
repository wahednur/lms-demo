"use client";

import { useAsync } from "@/hooks/use-async";
import { academicService, attendanceService, examService, routineService } from "@/services";
import { todayIso, todayWeekday } from "@/lib/weekday";
import type { Staff } from "@/types";

export function useTeacherDashboard(staff: Staff | null) {
  return useAsync(async () => {
    if (!staff) return null;

    const [assignments, routine, marks] = await Promise.all([
      academicService.listCourseAssignments({ teacherId: staff.id }),
      routineService.getTeacherRoutine(staff.id),
      examService.listMarks(),
    ]);

    const subjectIds = new Set(assignments.map((a) => a.subjectId));
    const subjects = await academicService.listSubjects();
    const subjectById = new Map(subjects.filter((s) => subjectIds.has(s.id)).map((s) => [s.id, s]));

    const today = todayIso();
    const todaysClasses = routine
      .filter((slot) => slot.day === todayWeekday())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const attendanceChecks = await Promise.all(
      todaysClasses.map((slot) => attendanceService.getRecord({ subjectId: slot.subjectId, date: today })),
    );
    const awaitingAttendance = todaysClasses.filter((_, i) => !attendanceChecks[i]);

    const myMarks = marks.filter((m) => subjectIds.has(m.subjectId));
    const draftMarks = myMarks.filter((m) => m.status === "draft" && m.history.some((h) => h.status === "returned"));
    const freshDrafts = myMarks.filter((m) => m.status === "draft" && !m.history.some((h) => h.status === "returned"));
    const submittedMarks = myMarks.filter((m) => m.status === "submitted");

    return {
      assignments,
      subjectById,
      todaysClasses,
      awaitingAttendance,
      returnedMarksCount: draftMarks.length,
      draftMarksCount: freshDrafts.length,
      submittedMarksCount: submittedMarks.length,
      routine,
    };
  }, [staff?.id]);
}
