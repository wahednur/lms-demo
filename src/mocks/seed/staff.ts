import type { Designation, Shift, Staff, StaffRole, TrainingRecord } from "@/types";
import { mulberry32, randomInt, SEED } from "./rng";
import { fullName, initialsOf, MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, SURNAMES } from "./names";

const rng = mulberry32(SEED + 11);

function fictionalPhone(): string {
  const prefixes = ["013", "014", "015", "016", "017", "018", "019"];
  const prefix = prefixes[randomInt(rng, 0, prefixes.length - 1)];
  let rest = "";
  for (let i = 0; i < 8; i++) rest += randomInt(rng, 0, 9);
  return `${prefix}${rest}`;
}

function fictionalNid(): string {
  return String(randomInt(rng, 1000, 9999));
}

let nameCursor = 0;
function nextName() {
  const isMale = nameCursor % 3 !== 0; // majority male, some female — matches a plausible faculty mix
  const pool = isMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  const first = pool[nameCursor % pool.length];
  const last = SURNAMES[(nameCursor * 7 + 3) % SURNAMES.length];
  nameCursor++;
  return fullName(first, last);
}

function training(id: string, titleEn: string, titleBn: string, year: number, weeks: number): TrainingRecord {
  return {
    id,
    title: { en: titleEn, bn: titleBn },
    institution: { en: "Bangladesh Technical Education Board — Training Wing", bn: "বাংলাদেশ কারিগরি শিক্ষা বোর্ড — প্রশিক্ষণ শাখা" },
    year,
    durationWeeks: weeks,
  };
}

interface StaffSeed {
  id: string;
  designation: Designation;
  departmentId: string | null;
  shift: Shift | "both" | null;
  isDepartmentHead: boolean;
  staffRole: StaffRole;
  joiningDate: string;
  trainings: TrainingRecord[];
}

const STAFF_SEED: StaffSeed[] = [
  { id: "stf-0001", designation: "principal", departmentId: null, shift: "both", isDepartmentHead: false, staffRole: "principal", joiningDate: "1998-03-01", trainings: [training("tr-1", "Educational Leadership", "শিক্ষা নেতৃত্ব প্রশিক্ষণ", 2015, 2)] },
  { id: "stf-0002", designation: "chief-instructor", departmentId: "dept-cst", shift: "1st", isDepartmentHead: true, staffRole: "hod", joiningDate: "2003-06-12", trainings: [training("tr-2", "Network Infrastructure", "নেটওয়ার্ক অবকাঠামো", 2018, 4)] },
  { id: "stf-0003", designation: "instructor", departmentId: "dept-cst", shift: "2nd", isDepartmentHead: true, staffRole: "hod", joiningDate: "2006-01-20", trainings: [training("tr-3", "Database Systems", "ডাটাবেজ সিস্টেম", 2019, 3)] },
  { id: "stf-0004", designation: "vice-principal", departmentId: null, shift: "both", isDepartmentHead: false, staffRole: "academic_incharge", joiningDate: "2001-09-05", trainings: [training("tr-4", "Academic Quality Assurance", "একাডেমিক মান নিশ্চয়তা", 2020, 2)] },
  { id: "stf-0005", designation: "instructor", departmentId: "dept-civil", shift: "2nd", isDepartmentHead: true, staffRole: "hod", joiningDate: "2007-04-18", trainings: [training("tr-5", "Structural Design Review", "কাঠামোগত ডিজাইন পর্যালোচনা", 2017, 3)] },
  { id: "stf-0006", designation: "chief-instructor", departmentId: "dept-civil", shift: "1st", isDepartmentHead: true, staffRole: "hod", joiningDate: "2002-11-02", trainings: [training("tr-6", "Site Survey Methods", "সার্ভে পদ্ধতি", 2016, 2)] },
  { id: "stf-0007", designation: "instructor", departmentId: "dept-electrical", shift: "1st", isDepartmentHead: true, staffRole: "hod", joiningDate: "2005-08-14", trainings: [training("tr-7", "Power Systems Safety", "পাওয়ার সিস্টেম সেফটি", 2018, 2)] },
  { id: "stf-0008", designation: "instructor", departmentId: "dept-electrical", shift: "2nd", isDepartmentHead: true, staffRole: "hod", joiningDate: "2008-02-27", trainings: [training("tr-8", "Industrial Automation", "ইন্ডাস্ট্রিয়াল অটোমেশন", 2021, 3)] },
  { id: "stf-0009", designation: "junior-instructor", departmentId: "dept-electronics", shift: "1st", isDepartmentHead: true, staffRole: "hod", joiningDate: "2010-05-09", trainings: [training("tr-9", "Embedded Systems", "এমবেডেড সিস্টেম", 2019, 4)] },
  { id: "stf-0010", designation: "instructor", departmentId: "dept-electronics", shift: "2nd", isDepartmentHead: true, staffRole: "hod", joiningDate: "2009-07-23", trainings: [training("tr-10", "Communication Systems Lab", "কমিউনিকেশন সিস্টেম ল্যাব", 2020, 2)] },
  { id: "stf-0011", designation: "junior-instructor", departmentId: "dept-cst", shift: "1st", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2016-03-15", trainings: [training("tr-11", "Web Application Development", "ওয়েব অ্যাপ্লিকেশন ডেভেলপমেন্ট", 2022, 3)] },
  { id: "stf-0012", designation: "junior-instructor", departmentId: "dept-cst", shift: "2nd", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2017-07-01", trainings: [training("tr-12", "Cybersecurity Fundamentals", "সাইবার নিরাপত্তা মূলনীতি", 2023, 2)] },
  { id: "stf-0013", designation: "junior-instructor", departmentId: "dept-civil", shift: "1st", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2015-10-11", trainings: [training("tr-13", "AutoCAD Advanced", "অটোক্যাড অ্যাডভান্সড", 2019, 2)] },
  { id: "stf-0014", designation: "junior-instructor", departmentId: "dept-civil", shift: "2nd", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2018-01-09", trainings: [training("tr-14", "Estimating & Costing", "এস্টিমেটিং ও কস্টিং", 2021, 2)] },
  { id: "stf-0015", designation: "junior-instructor", departmentId: "dept-electrical", shift: "1st", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2014-12-03", trainings: [training("tr-15", "Renewable Energy Systems", "নবায়নযোগ্য শক্তি ব্যবস্থা", 2020, 3)] },
  { id: "stf-0016", designation: "junior-instructor", departmentId: "dept-electrical", shift: "2nd", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2019-06-22", trainings: [training("tr-16", "PLC Programming", "পিএলসি প্রোগ্রামিং", 2022, 2)] },
  { id: "stf-0017", designation: "junior-instructor", departmentId: "dept-electronics", shift: "1st", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2016-09-30", trainings: [training("tr-17", "IoT Prototyping", "আইওটি প্রোটোটাইপিং", 2023, 3)] },
  { id: "stf-0018", designation: "junior-instructor", departmentId: "dept-electronics", shift: "2nd", isDepartmentHead: false, staffRole: "teacher", joiningDate: "2020-02-17", trainings: [] },
  { id: "stf-0019", designation: "registrar", departmentId: null, shift: "both", isDepartmentHead: false, staffRole: "staff", joiningDate: "2012-04-01", trainings: [] },
  { id: "stf-0020", designation: "workshop-super", departmentId: "dept-cst", shift: "both", isDepartmentHead: false, staffRole: "staff", joiningDate: "2013-08-19", trainings: [] },
];

const NAME_OVERRIDES: Record<string, { bn: string; en: string }> = {
  "stf-0001": { bn: "নিজাম উদ্দিন আহমেদ", en: "Nizam Uddin Ahmed" },
};

export const STAFF: Staff[] = STAFF_SEED.map((s) => {
  const generated = nextName();
  const name = NAME_OVERRIDES[s.id] ?? generated;
  return {
    id: s.id,
    name,
    photoInitials: initialsOf(name.en),
    designation: s.designation,
    departmentId: s.departmentId,
    shift: s.shift,
    isDepartmentHead: s.isDepartmentHead,
    staffRole: s.staffRole,
    phone: fictionalPhone(),
    email: `${s.id.replace("stf-", "staff")}@sgpi.example`,
    joiningDate: s.joiningDate,
    status: "active",
    trainings: s.trainings,
    nidLast4: fictionalNid(),
  };
});

export const STAFF_BY_ID: Record<string, Staff> = Object.fromEntries(STAFF.map((s) => [s.id, s]));

export const TEACHING_STAFF = STAFF.filter(
  (s) => s.staffRole === "hod" || s.staffRole === "teacher",
);
