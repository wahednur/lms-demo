"use client";

import { useAsync } from "@/hooks/use-async";
import {
  academicService,
  attendanceService,
  examService,
  noticeService,
  resourceService,
  routineService,
  staffService,
} from "@/services";
import { todayWeekday } from "@/lib/weekday";
import type { RoutineSlot, Staff, Student, Subject } from "@/types";

export interface TodayClass extends RoutineSlot {
  subject: Subject | undefined;
  teacher: Staff | null;
}

export function useStudentDashboard(student: Student | null) {
  return useAsync(async () => {
    if (!student) return null;

    const [routine, attendanceSummary, resultHistory, notices, subjects, department] = await Promise.all([
      routineService.listSlots({
        departmentId: student.departmentId,
        semester: student.semester,
        shift: student.shift,
        session: student.session,
      }),
      attendanceService.getStudentSummary(student.id, student.session),
      examService.getStudentResultHistory(student.id),
      noticeService.list({ audience: "students", departmentId: student.departmentId }),
      academicService.listSubjects({ departmentId: student.departmentId, semester: student.semester }),
      academicService.getDepartment(student.departmentId),
    ]);

    const todaySlots = routine
      .filter((slot) => slot.day === todayWeekday())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const subjectById = new Map(subjects.map((s) => [s.id, s]));
    const todaysClasses: TodayClass[] = await Promise.all(
      todaySlots.map(async (slot) => ({
        ...slot,
        subject: subjectById.get(slot.subjectId),
        teacher: await staffService.getById(slot.teacherId),
      })),
    );

    const subjectIds = subjects.map((s) => s.id);
    const resources = (await resourceService.list()).filter((r) => subjectIds.includes(r.subjectId));

    const latestResult = resultHistory.length > 0 ? resultHistory[resultHistory.length - 1] : null;

    return { todaysClasses, attendanceSummary, latestResult, notices, resources, subjects, department };
  }, [student?.id]);
}
