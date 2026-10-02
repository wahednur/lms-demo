/**
 * Runtime smoke test for mock-service business logic: duplicate rejection,
 * promotion, mark workflow transitions (including the publish-blocks-until-
 * fully-verified rule), and routine conflict detection. Not a full test
 * suite — just enough to catch logic regressions before wiring up UI.
 *
 * Run with: npx tsx scripts/check-workflows.ts
 */

// Minimal in-memory localStorage shim so services/mock's storage.ts (which
// gates on `typeof window === "undefined"`) behaves as it would in a browser.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  get length() {
    return this.store.size;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}
(globalThis as unknown as { window: unknown }).window = { localStorage: new MemoryStorage() };

async function main() {
  const { studentService } = await import("../src/services/mock/student-service");
  const { examService } = await import("../src/services/mock/exam-service");
  const { routineService } = await import("../src/services/mock/routine-service");
  const { HERO_EXAM_ID, HERO_SUBJECTS } = await import("../src/mocks/seed/examinations");
  const { STUDENTS } = await import("../src/mocks/seed/students");

  let failures = 0;
  const check = (label: string, cond: boolean) => {
    console.log(`${cond ? "PASS" : "FAIL"} — ${label}`);
    if (!cond) failures++;
  };

  // 1. Duplicate roll rejection
  const heroStudent = STUDENTS.find(
    (s) => s.departmentId === "dept-cst" && s.shift === "1st" && s.semester === 5,
  )!;
  try {
    await studentService.create(
      {
        nameBn: "টেস্ট", nameEn: "Test Student", roll: heroStudent.roll, registrationNo: "REG-TEST-0001",
        gender: "male", dateOfBirth: "2005-01-01", bloodGroup: "unknown", phone: "01700000000", email: "",
        departmentId: heroStudent.departmentId, semester: heroStudent.semester, session: heroStudent.session, shift: heroStudent.shift,
        fatherNameBn: "ক", fatherNameEn: "F", motherNameBn: "খ", motherNameEn: "M", guardianPhone: "01700000001",
        presentAddressBn: "ক", presentAddressEn: "A", permanentAddressBn: "ক", permanentAddressEn: "A",
      },
      "usr-0001",
    );
    check("duplicate roll rejected", false);
  } catch {
    check("duplicate roll rejected", true);
  }

  // 2. Create + promote
  const created = await studentService.create(
    {
      nameBn: "নতুন শিক্ষার্থী", nameEn: "New Student", roll: "99", registrationNo: "REG-TEST-0002",
      gender: "female", dateOfBirth: "2006-01-01", bloodGroup: "O+", phone: "01700000002", email: "",
      departmentId: "dept-cst", semester: 1, session: "2025-2026", shift: "1st",
      fatherNameBn: "ক", fatherNameEn: "F", motherNameBn: "খ", motherNameEn: "M", guardianPhone: "01700000003",
      presentAddressBn: "ক", presentAddressEn: "A", permanentAddressBn: "ক", permanentAddressEn: "A",
    },
    "usr-0001",
  );
  check("student created", !!created.id);
  const promoted = await studentService.promote(created.id, 2, "2025-2026", "usr-0004");
  check("student promoted to semester 2", promoted.semester === 2);
  check("promotion history recorded", promoted.promotionHistory.length === 1);

  // 3. Publish blocked until fully verified (webAppDev has zero seeded rows)
  try {
    await examService.publishResults(HERO_EXAM_ID, "usr-0001");
    check("publish blocked while a subject is unentered", false);
  } catch {
    check("publish blocked while a subject is unentered", true);
  }

  // Enter + submit + verify the missing subject for all hero students, then publish should succeed.
  const heroStudents = STUDENTS.filter(
    (s) => s.departmentId === "dept-cst" && s.shift === "1st" && s.semester === 5 && s.status === "active",
  );
  const drafted = await examService.saveDraftMarks(
    heroStudents.map((s) => ({ examId: HERO_EXAM_ID, subjectId: HERO_SUBJECTS.webAppDev.id, studentId: s.id, tc: 18, pc: 4, tf: 55, pf: 13 })),
    "usr-0011",
  );
  check("draft marks saved for all hero students", drafted.length === heroStudents.length);
  const submitted = await examService.submitForVerification(drafted.map((m) => m.id), "usr-0011");
  check("marks submitted", submitted.every((m) => m.status === "submitted"));
  const verified = await examService.verifyMarks(submitted.map((m) => m.id), "usr-0002");
  check("marks verified", verified.every((m) => m.status === "verified"));
  const published = await examService.publishResults(HERO_EXAM_ID, "usr-0001");
  check("publish succeeds once fully verified", published.length > 0);

  const result = await examService.getSemesterResult(heroStudents[0].id, 5, heroStudents[0].session);
  check("student now has a published semester result", !!result && result.publishedAt !== null);

  // 4. Routine conflict detection
  const existingSlot = (await routineService.listSlots({ departmentId: "dept-cst", shift: "1st" }))[0];
  const conflicts = await routineService.checkConflicts({
    departmentId: existingSlot.departmentId,
    semester: existingSlot.semester,
    shift: existingSlot.shift,
    session: existingSlot.session,
    day: existingSlot.day,
    startTime: existingSlot.startTime,
    endTime: existingSlot.endTime,
    subjectId: existingSlot.subjectId,
    teacherId: existingSlot.teacherId,
    room: existingSlot.room,
    kind: existingSlot.kind,
  });
  check("conflicting slot is detected", conflicts.length > 0);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main();
