import type {
  BloodGroup,
  Gender,
  SemesterNumber,
  Shift,
  Student,
  StudentStatus,
} from "@/types";
import { mulberry32, randomInt, SEED } from "./rng";
import {
  fullName,
  initialsOf,
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  SURNAMES,
  UPAZILA_PLACES,
} from "./names";
import { DEPARTMENTS } from "./departments";
import { SEMESTER_TO_SESSION, ALUMNI_SESSION } from "./sessions";

const rng = mulberry32(SEED + 777);

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"];

function fictionalPhone(): string {
  const prefixes = ["013", "014", "015", "016", "017", "018", "019"];
  const prefix = prefixes[randomInt(rng, 0, prefixes.length - 1)];
  let rest = "";
  for (let i = 0; i < 8; i++) rest += randomInt(rng, 0, 9);
  return `${prefix}${rest}`;
}

let nameCursor = 0;
function nextGenderedName(): { name: { bn: string; en: string }; gender: Gender } {
  const isMale = nameCursor % 5 !== 2; // ~80% male / 20% female, a plausible polytechnic mix
  const pool = isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  const first = pool[nameCursor % pool.length];
  const last = SURNAMES[(nameCursor * 5 + 2) % SURNAMES.length];
  nameCursor++;
  return { name: fullName(first, last), gender: isMale ? "male" : "female" };
}

interface Cell {
  departmentId: string;
  shift: Shift;
  semester: SemesterNumber;
  size: number;
}

function buildCells(): Cell[] {
  const cells: Cell[] = [];
  for (const dept of DEPARTMENTS) {
    for (const shift of dept.shifts) {
      for (let sem = 1; sem <= 8; sem++) {
        const isHero = dept.id === "dept-cst" && shift === "1st" && sem === 5;
        cells.push({ departmentId: dept.id, shift, semester: sem as SemesterNumber, size: isHero ? 12 : 2 });
      }
    }
  }
  return cells;
}

let globalSeq = 0;
let studentCounter = 0;

function makeStudent(opts: {
  departmentId: string;
  shift: Shift;
  semester: SemesterNumber;
  session: string;
  status: StudentStatus;
  rollInClass: number;
}): Student {
  studentCounter++;
  globalSeq++;
  const dept = DEPARTMENTS.find((d) => d.id === opts.departmentId)!;
  const { name, gender } = nextGenderedName();
  const { name: fatherName } = nextGenderedName();
  const { name: motherName } = (() => {
    nameCursor++; // advance past a throwaway male slot so mother's name pulls female pool predictably
    const r = nextGenderedName();
    return r;
  })();
  const startYear = Number(opts.session.split("-")[0]);
  const place = UPAZILA_PLACES[studentCounter % UPAZILA_PLACES.length];
  const roll = String(opts.rollInClass).padStart(2, "0");
  const registrationNo = `REG-${startYear}-${dept.code}-${String(globalSeq).padStart(4, "0")}`;
  const id = `std-${String(studentCounter).padStart(4, "0")}`;

  const dob = `${startYear - 18}-${String(randomInt(rng, 1, 12)).padStart(2, "0")}-${String(
    randomInt(rng, 1, 28),
  ).padStart(2, "0")}`;
  const admissionDate = `${startYear}-07-01`;

  const stipendEligible = studentCounter % 3 === 0;
  const stipend = opts.status === "alumni"
    ? []
    : [
        {
          session: opts.session,
          eligible: stipendEligible,
          disbursed: stipendEligible && opts.semester > 1,
          amountBdt: stipendEligible ? 750 : null,
          remarks: stipendEligible ? undefined : "Did not meet attendance threshold for this term.",
        },
      ];

  const promotionHistory = [];
  for (let s = opts.semester - 1; s >= 1; s--) {
    const fromSession = SEMESTER_TO_SESSION[s as SemesterNumber];
    promotionHistory.push({
      fromSemester: s as SemesterNumber,
      toSemester: (s + 1) as SemesterNumber,
      session: fromSession,
      date: `${Number(fromSession.split("-")[0]) + (s % 2 === 0 ? 1 : 0)}-${s % 2 === 0 ? "01" : "07"}-15`,
      promotedBy: "usr-0004",
    });
  }

  return {
    id,
    roll,
    registrationNo,
    name,
    photoInitials: initialsOf(name.en),
    gender,
    dateOfBirth: dob,
    bloodGroup: BLOOD_GROUPS[randomInt(rng, 0, BLOOD_GROUPS.length - 1)],
    phone: fictionalPhone(),
    email: `${id}@student.sgpi.example`,
    departmentId: opts.departmentId,
    semester: opts.semester,
    session: opts.session,
    shift: opts.shift,
    status: opts.status,
    admissionDate,
    guardian: {
      fatherName,
      motherName,
      guardianPhone: fictionalPhone(),
      presentAddress: { bn: `গ্রাম: দক্ষিণপাড়া, ${place.bn}`, en: `Village: Dakkhinpara, ${place.en}` },
      permanentAddress: { bn: `গ্রাম: দক্ষিণপাড়া, ${place.bn}`, en: `Village: Dakkhinpara, ${place.en}` },
    },
    stipend,
    alumni:
      opts.status === "alumni"
        ? { passedYear: startYear + 4, finalCgpa: Math.round((2.6 + (studentCounter % 14) / 10) * 100) / 100 }
        : undefined,
    promotionHistory,
  };
}

function buildStudents(): Student[] {
  const students: Student[] = [];

  for (const cell of buildCells()) {
    const session = SEMESTER_TO_SESSION[cell.semester];
    for (let i = 1; i <= cell.size; i++) {
      students.push(
        makeStudent({
          departmentId: cell.departmentId,
          shift: cell.shift,
          semester: cell.semester,
          session,
          status: "active",
          rollInClass: i,
        }),
      );
    }
  }

  // A small already-graduated cohort to populate the Alumni feature —
  // distinct from current semester-8 students, who are still active.
  const alumniPerDept = 3;
  for (const dept of DEPARTMENTS) {
    for (let i = 1; i <= alumniPerDept; i++) {
      students.push(
        makeStudent({
          departmentId: dept.id,
          shift: "1st",
          semester: 8,
          session: ALUMNI_SESSION,
          status: "alumni",
          rollInClass: 90 + i,
        }),
      );
    }
  }

  return students;
}

export const STUDENTS: Student[] = buildStudents();
export const STUDENT_BY_ID: Record<string, Student> = Object.fromEntries(
  STUDENTS.map((s) => [s.id, s]),
);
