# EMIS Prototype — Progress Log

Sherpur Government Polytechnic Institute — EMIS demonstration prototype.
Source of truth for requirements: `docs/EMIS_Proposal.pdf`.

This file is the resumable record of what's done, what's left, and decisions
made along the way. Update it as work progresses so the build can resume
without re-deriving context.

## Stack (confirmed installed versions)
- Next.js 16.3.8 (App Router, TS strict, src/ dir, Turbopack off for installs only — dev/build use default)
- React 19.2.8
- Tailwind CSS v4 (CSS-based theme, no tailwind.config.ts)
- shadcn/ui — style `radix-nova`, base `radix`, icons `lucide`, CSS variables on
  - NOTE: this shadcn version has **no `form.tsx` primitive** (Base-UI-era registry). We hand-roll
    a small `components/shared/form-field.tsx` wrapper around react-hook-form instead of the
    classic shadcn `<Form>` component.
- lucide-react, react-hook-form, @hookform/resolvers, zod, @tanstack/react-table, recharts,
  clsx, class-variance-authority, tailwind-merge, date-fns, next-themes, sonner
- Package manager: npm (lockfile: package-lock.json). `.npmrc` sets `allow-scripts=false`
  (the user's global `.npmrc` has a project-scoped `allow-scripts` entry that breaks fresh
  `npm install`/create-next-app in new projects — this project-local override fixes it;
  did not touch the user's global config).

## Decisions / assumptions (documented per brief §17)
- Demo session = client-side mock only, stored in localStorage, clearly labeled everywhere as simulated.
- 5 demo roles: principal, academic_incharge, hod, teacher, student — matches PDF page 5 exactly.
- Permission matrix encoded verbatim from PDF page 5 (7 functions × 5 roles) in `lib/permissions/matrix.ts`.
- Grading/GPA logic is isolated in `lib/grading.ts`, explicitly labeled "illustrative, not verified BTEB
  compliant" per brief §8/§16 — UI surfaces this disclaimer wherever grades are shown.
- Result workflow: Draft → Submitted → Verified → Published (teacher drafts/submits, HOD verifies or
  returns with reason, Principal publishes). Students only ever see Published.
- Institute identity: name/address taken from PDF header. No real logo supplied → placeholder mark
  (initials-based) used. No fabricated accreditation/testimonials.
- Future-phase registry (not built as working features): online admission, online application, fee
  payment, SMS/email notification, digital ID card, certificate/document verification, mobile app,
  industrial attachment tracking, lab/workshop inventory — all from PDF §10, plus industrial
  attachment + lab inventory mentioned in role/future text.
- Seed data: 4 departments (Computer, Civil, Electrical, Electronics — matches committee dept list in
  PDF), both shifts, sessions 2021–2025, ~130 students, ~16 staff. Deterministic generation (seeded
  PRNG with fixed integer seed, no `Math.random()`/`Date.now()` at module load) so numbers are stable
  across reloads/builds.

## Status by task

- [x] 1. Scaffold Next.js + install stack + shadcn init + components
- [x] 2. Core architecture: types / i18n / permissions / validation / grading / services/mock / services/api
      boundary — DONE. All 11 service contracts implemented over seed+localStorage. Verified with
      `npm run typecheck` (clean) and `npm run check-workflows` (scripts/check-workflows.ts — duplicate
      rejection, promotion, full mark workflow incl. publish-blocked-until-fully-verified, routine
      conflict detection — all pass). Re-run after any service-layer edit.
- [x] 3. Seed dataset — 150 students, 20 staff, 104 subjects, 302 routine slots (0 teacher/room conflicts),
      43 attendance records, 160 examinations, 2030 mark entries, 10 notices, 18 resources, 23 users.
      Verified with `npm run check-seed` (scripts/check-seed.ts) — 0 duplicate roll/registration, 0
      referential-integrity failures, 0 routine conflicts. Re-run this after any seed edit.
- [x] 4. Design system / shared UI — navy theme + status tokens in globals.css, Bangla font (Noto Sans
      Bengali + Geist via CSS font stack), shared components (StatusBadge, EmptyState, PageHeader,
      ConfirmDialog, LanguageSwitcher, DemoIndicator, StatCard, loading/skeletons, DataTable wrapping
      TanStack Table v9 — see note below), InstituteMark placeholder logo, SiteHeader/SiteFooter,
      AppSidebarShell (shared sidebar+topbar for portal/admin with built-in route guard).
- [x] 5. Demo session / role switcher — SessionProvider (lib wraps services/mock/session-service),
      RoleSwitcher dropdown, /login page with 5 role cards + simulated-login disclaimer, redirect-aware
      (`?next=`).
- [x] 6. Public website routes — /, /about, /departments, /departments/[slug], /notices, /notices/[id],
      /contact, /login. `npm run build` passes (all static except the two [param] routes, correctly
      dynamic). KNOWN GOTCHA fixed: Server Components cannot pass a Lucide icon *component reference* as
      a prop into a "use client" child (RSC serialization error) — icon selection must happen inside the
      client component itself (keyed off a label/variant prop), see home-text.tsx / department-stat-
      block.tsx for the pattern. Apply the same pattern if more Server->Client icon props come up.
- [x] 7. Student portal routes — dashboard, profile (tabs: personal/guardian/academic/stipend/history),
      attendance (summary + by-subject + detailed records), results (per-semester tabs, GRADE_DISCLAIMER
      shown), routine (grouped-by-day, printable), notices, resources (download = toast explaining it's
      a demo placeholder, never a silent no-op). Shared hooks added: hooks/use-async.ts (generic fetch
      state), use-current-student.ts, use-current-staff.ts, use-student-dashboard.ts. Reusable domain
      components: StudentProfileTabs, SemesterResultView, RoutineGrid, ResourceList — all reused later by
      teacher/admin pages. `npm run build` passes for all 7 routes.
- [x] 8. Teacher portal routes — dashboard (today's classes / awaiting attendance / returned+draft
      marks counts), profile, courses, attendance (THE core interactive flow: select class → date →
      roster → present/absent toggle per student with genuine tri-state unset/present/absent, mark-all-
      present, save, reopen-and-edit an already-recorded date), marks (select class → examination →
      TC/PC/TF/PF grid scoped to the subject's actual components, save draft → submit for verification,
      locked once submitted/verified/published, shows HOD's return reason inline), routine (printable),
      resources (+ add-resource dialog, demo-labeled, no real file). New hooks: use-teacher-dashboard.ts.
      New reusable domain components: AttendanceEntryForm, MarksEntryForm, StaffProfileTabs,
      AddResourceDialog. `npm run build` passes for all 7 routes.
  NOTE on React Compiler-era lint rules encountered repeatedly and how they were resolved — relevant
  for any new hook/component written later:
    - `react-hooks/set-state-in-effect`: legitimate for "fetch on mount/dep-change" — add a one-line
      `eslint-disable-next-line` with justification, don't contort the code. (lib/i18n/context.tsx,
      session-provider.tsx, use-async.ts, attendance-entry-form.tsx all do this.)
    - `react-hooks/refs`: never mutate a ref's `.current` during render — only in an effect or handler.
      (use-async.ts fixed by syncing the "latest fn" ref inside its own effect.)
    - "Adjusting state when a prop changes" (resetting state when a derived value changes) should be
      done during render via the prev-value-comparison pattern, NOT a useEffect — see marks-entry-
      form.tsx's `examsForReset` for the canonical fix.
    - `react-hooks/purity`: never call `Math.random()`/`Date.now()` directly in component/render code —
      isolate in a plain exported function (lib/async.ts's `randomFileSizeKb`/`newId`) and call that.
    - `react-hooks/static-components`: never define a component function inside another component's
      render body (resets state every render) — hoist it to module scope and pass props
      (app-sidebar-shell.tsx's `SidebarNavList`).
    - Server Component → Client Component prop passing cannot carry a function/component reference
      (e.g. a Lucide icon) — see the task-6 note above.
- [x] 9. Admin dashboard routes — all 14: overview (charts: enrollment-by-dept bar + grade-distribution
      bar, both using the dataviz-skill-validated categorical/status palettes in globals.css), students
      (list+DataTable+filters, detail with promote/move-to-alumni/edit), staff (list, detail with
      activate/deactivate/add-training), academics (subjects/course-distribution/calendar tabs),
      attendance (30-day trend chart + missing-entries panel + recent records), examinations (create +
      verification queue with bulk verify/return-with-reason), results (publish workflow, principal-only,
      surfaces the service's own validation error text), routine (full CRUD with LIVE conflict checking
      before save, delete, print), reports (student register/staff/attendance/result tabs, CSV export via
      lib/csv.ts + print), users/roles/audit-logs/settings (principal-only via NEW RequireCapability
      in-page guard — nav-hiding alone isn't a real guard, a direct URL visit is now also blocked).
      New lib: csv.ts, demo-reset.ts (single resetDemoData() impl shared by /admin/settings and the
      later demo helper). `npm run build` passes — all 36 routes.
- [x] 10. Future-phase feature registry — `/future` (grid via `FutureFeatureGrid` +
      `futureFeatureService.list()`) and `/future/[id]` detail route. Confirmed present and compiling
      as static output in `npm run build`.
- [ ] 11. Presentation/demo helper
- [x] 12. Quality pass (build, typecheck, logic tests, manual flow check) — `npm run typecheck`
      clean, `npm run check-seed` 0 integrity failures, `npm run check-workflows` all PASS, `npm run
      build` succeeds for all 37 routes, `scripts/smoke-test.mjs` (Playwright) 11/11 checks pass with
      0 console/page errors (`scripts/smoke-summary.json`) (2026-10-03).
- [x] 13. Documentation and handoff — `README.md` rewritten with real project overview, setup, demo
      accounts, scripts, and architecture pointers (2026-10-03). Still open: task 11 (presentation/demo
      helper) is the only remaining unchecked item.

## TanStack Table v9 note (installed version is 9.2.4, NOT the commonly-documented v8 API)
v9 replaced `useReactTable`/`getCoreRowModel()` etc. with `useTable({features, columns, data})` where
`features = tableFeatures({...slots})`. Since every list page's pagination/sort/search already happens
server-side via the typed mock services (`Page<T>` with page/pageSize/total), `components/shared/
data-table.tsx` registers **zero** row-model feature slots (`tableFeatures({})`) — TanStack only
supplies header/row/cell model + `table.FlexRender`; sorting/pagination UI is driven by plain props
(`sort`, `onSortChange`, `pagination`, `onPageChange`) wired straight into the service call. Column defs
are authored with `createDataTableColumns<T>()` (wraps `createColumnHelper<typeof features, T>()`).
Confirmed against installed `node_modules/@tanstack/*` `.d.ts` files and the `@tanstack/intent` CLI skill
docs (`npx @tanstack/intent@latest load @tanstack/react-table#getting-started`, etc.) — do not "fix" this
to look like v8 code from memory.

## Resume notes
If context resets, read this file + `docs/EMIS_Proposal.pdf` + skim `src/types/` and
`src/services/contracts/` before continuing. Directory layout is fixed (see §12 of the
original brief / mirrored below) — don't restructure without updating this file.

```
src/
  types/            domain models
  lib/i18n/         bn/en dictionary + provider + formatters
  lib/permissions/  role-permission matrix + can() helper
  lib/validation/   zod schemas
  lib/grading.ts    illustrative grade/GPA utility (isolated, labeled)
  services/contracts/  typed service interfaces
  services/mock/        mock implementations (reads mocks/seed, persists via mocks/storage)
  services/api/          documented HTTP adapter boundary (stub, not wired)
  mocks/seed/        deterministic fictional dataset
  mocks/storage/     versioned localStorage wrapper
  components/ui/      shadcn primitives
  components/shared/  cross-cutting reusable components
  components/domain/  feature-specific composite components
  app/(public)/...    public site
  app/login/
  app/portal/student/...
  app/portal/teacher/...
  app/admin/...
```
