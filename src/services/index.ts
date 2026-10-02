/**
 * Service locator — the ONLY file feature code should import service
 * instances from. Everything here currently resolves to `services/mock`;
 * pointing this at `services/api` implementations later is the entire
 * frontend-side cost of connecting a real backend (see services/api/README.md).
 */
export {
  studentService,
  staffService,
  academicService,
  attendanceService,
  examService,
  routineService,
  noticeService,
  resourceService,
  futureFeatureService,
  sessionService,
  userService,
  auditService,
  reportService,
} from "./mock";
