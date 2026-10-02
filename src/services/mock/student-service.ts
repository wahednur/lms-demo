import type { StudentService, StudentListParams } from "@/services/contracts";
import type { Page, Student, SystemUser } from "@/types";
import { ServiceError } from "@/types";
import type { StudentFormValues } from "@/lib/validation/student";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { STUDENTS, USERS } from "@/mocks/seed";
import { delay, newId } from "@/lib/async";
import { auditService } from "./audit-service";

function readAll(): Student[] {
  return storage.read(STORAGE_KEYS.students, STUDENTS);
}
function writeAll(students: Student[]) {
  storage.write(STORAGE_KEYS.students, students);
}

function assertNoDuplicate(students: Student[], candidate: Pick<Student, "roll" | "registrationNo" | "departmentId" | "semester" | "shift" | "session">, excludeId?: string) {
  const rollClash = students.find(
    (s) =>
      s.id !== excludeId &&
      s.departmentId === candidate.departmentId &&
      s.semester === candidate.semester &&
      s.shift === candidate.shift &&
      s.session === candidate.session &&
      s.roll === candidate.roll,
  );
  if (rollClash) {
    throw new ServiceError("CONFLICT", "form.duplicateRoll", { field: "roll" });
  }
  const regClash = students.find((s) => s.id !== excludeId && s.registrationNo === candidate.registrationNo);
  if (regClash) {
    throw new ServiceError("CONFLICT", "form.duplicateRegistration", { field: "registrationNo" });
  }
}

function initialsOf(nameEn: string): string {
  return nameEn.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function formToStudent(input: StudentFormValues, existing?: Student): Student {
  const name = { bn: input.nameBn, en: input.nameEn };
  return {
    id: existing?.id ?? newId("std"),
    roll: input.roll,
    registrationNo: input.registrationNo,
    name,
    photoInitials: initialsOf(input.nameEn),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    bloodGroup: input.bloodGroup,
    phone: input.phone,
    email: input.email || `${existing?.id ?? "new-student"}@student.sgpi.example`,
    departmentId: input.departmentId,
    semester: input.semester,
    session: input.session,
    shift: input.shift,
    status: existing?.status ?? "active",
    admissionDate: existing?.admissionDate ?? new Date().toISOString().slice(0, 10),
    guardian: {
      fatherName: { bn: input.fatherNameBn, en: input.fatherNameEn },
      motherName: { bn: input.motherNameBn, en: input.motherNameEn },
      guardianPhone: input.guardianPhone,
      presentAddress: { bn: input.presentAddressBn, en: input.presentAddressEn },
      permanentAddress: { bn: input.permanentAddressBn, en: input.permanentAddressEn },
    },
    stipend: existing?.stipend ?? [],
    alumni: existing?.alumni,
    promotionHistory: existing?.promotionHistory ?? [],
  };
}

function provisionLogin(student: Student) {
  const users = storage.read<SystemUser[]>(STORAGE_KEYS.users, USERS);
  if (users.some((u) => u.linkedStudentId === student.id)) return;
  const user: SystemUser = {
    id: newId("usr-std"),
    name: student.name,
    role: "student",
    email: student.email,
    active: true,
    linkedStudentId: student.id,
    departmentId: student.departmentId,
    lastLoginAt: null,
  };
  storage.write(STORAGE_KEYS.users, [...users, user]);
}

export const studentService: StudentService = {
  async list(params: StudentListParams = {}) {
    await delay();
    let items = readAll();
    if (params.departmentId) items = items.filter((s) => s.departmentId === params.departmentId);
    if (params.semester) items = items.filter((s) => s.semester === params.semester);
    if (params.shift) items = items.filter((s) => s.shift === params.shift);
    if (params.session) items = items.filter((s) => s.session === params.session);
    if (params.status) items = items.filter((s) => s.status === params.status);
    if (params.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (s) =>
          s.name.en.toLowerCase().includes(q) ||
          s.name.bn.includes(q) ||
          s.roll.toLowerCase().includes(q) ||
          s.registrationNo.toLowerCase().includes(q),
      );
    }
    if (params.sortBy) {
      const dir = params.sortDir === "desc" ? -1 : 1;
      const key = params.sortBy as keyof Student;
      items = [...items].sort((a, b) => {
        const av = String(a[key] ?? "");
        const bv = String(b[key] ?? "");
        return av.localeCompare(bv) * dir;
      });
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const result: Page<Student> = {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    };
    return result;
  },

  async getById(id: string) {
    await delay(180);
    return readAll().find((s) => s.id === id) ?? null;
  },

  async create(input, actorUserId) {
    await delay(320);
    const students = readAll();
    assertNoDuplicate(students, input);
    const student = formToStudent(input);
    writeAll([student, ...students]);
    provisionLogin(student);
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "create",
      entityType: "student",
      entityId: student.id,
      summary: `Registered new student ${student.name.en} (roll ${student.roll}).`,
    });
    return student;
  },

  async update(id, input, actorUserId) {
    await delay(300);
    const students = readAll();
    const existing = students.find((s) => s.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `Student ${id} not found`);
    const merged: StudentFormValues = {
      nameBn: input.nameBn ?? existing.name.bn,
      nameEn: input.nameEn ?? existing.name.en,
      roll: input.roll ?? existing.roll,
      registrationNo: input.registrationNo ?? existing.registrationNo,
      gender: input.gender ?? existing.gender,
      dateOfBirth: input.dateOfBirth ?? existing.dateOfBirth,
      bloodGroup: input.bloodGroup ?? existing.bloodGroup,
      phone: input.phone ?? existing.phone,
      email: input.email ?? existing.email,
      departmentId: input.departmentId ?? existing.departmentId,
      semester: input.semester ?? existing.semester,
      session: input.session ?? existing.session,
      shift: input.shift ?? existing.shift,
      fatherNameBn: input.fatherNameBn ?? existing.guardian.fatherName.bn,
      fatherNameEn: input.fatherNameEn ?? existing.guardian.fatherName.en,
      motherNameBn: input.motherNameBn ?? existing.guardian.motherName.bn,
      motherNameEn: input.motherNameEn ?? existing.guardian.motherName.en,
      guardianPhone: input.guardianPhone ?? existing.guardian.guardianPhone,
      presentAddressBn: input.presentAddressBn ?? existing.guardian.presentAddress.bn,
      presentAddressEn: input.presentAddressEn ?? existing.guardian.presentAddress.en,
      permanentAddressBn: input.permanentAddressBn ?? existing.guardian.permanentAddress.bn,
      permanentAddressEn: input.permanentAddressEn ?? existing.guardian.permanentAddress.en,
    };
    assertNoDuplicate(students, merged, id);
    const updated = formToStudent(merged, existing);
    writeAll(students.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "update",
      entityType: "student",
      entityId: id,
      summary: `Updated profile for ${updated.name.en}.`,
    });
    return updated;
  },

  async promote(id, toSemester, session, actorUserId) {
    await delay(300);
    const students = readAll();
    const existing = students.find((s) => s.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `Student ${id} not found`);
    if (existing.status !== "active") {
      throw new ServiceError("VALIDATION", "Only active students can be promoted.");
    }
    const updated: Student = {
      ...existing,
      semester: toSemester,
      session,
      promotionHistory: [
        {
          fromSemester: existing.semester,
          toSemester,
          session,
          date: new Date().toISOString().slice(0, 10),
          promotedBy: actorUserId,
        },
        ...existing.promotionHistory,
      ],
    };
    writeAll(students.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "hod",
      action: "promote",
      entityType: "student",
      entityId: id,
      summary: `Promoted ${existing.name.en} from semester ${existing.semester} to ${toSemester}.`,
    });
    return updated;
  },

  async moveToAlumni(id, input, actorUserId) {
    await delay(300);
    const students = readAll();
    const existing = students.find((s) => s.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `Student ${id} not found`);
    const updated: Student = { ...existing, status: "alumni", alumni: input };
    writeAll(students.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "move-to-alumni",
      entityType: "student",
      entityId: id,
      summary: `Moved ${existing.name.en} to alumni (passed ${input.passedYear}).`,
    });
    return updated;
  },

  async setStipend(id, record, actorUserId) {
    await delay(250);
    const students = readAll();
    const existing = students.find((s) => s.id === id);
    if (!existing) throw new ServiceError("NOT_FOUND", `Student ${id} not found`);
    const stipend = [...existing.stipend.filter((r) => r.session !== record.session), record];
    const updated: Student = { ...existing, stipend };
    writeAll(students.map((s) => (s.id === id ? updated : s)));
    await auditService.record({
      actorUserId,
      actorRoleAtTime: "principal",
      action: "update",
      entityType: "student",
      entityId: id,
      summary: `Updated stipend record for ${existing.name.en} (${record.session}).`,
    });
    return updated;
  },
};
