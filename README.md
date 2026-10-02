# EMIS Prototype — Sherpur Government Polytechnic Institute

A client-side demonstration prototype of an Education Management Information System,
built for Sherpur Government Polytechnic Institute. Requirements source of truth:
`docs/EMIS_Proposal.pdf`.

**This is a demo, not a production system.** There is no real backend — all data lives in
a deterministic seed dataset plus `localStorage`, and every screen is labeled as simulated.
See `PROGRESS.md` for the full build log and outstanding items.

## Stack

Next.js 16 (App Router, TS strict) · React 19 · Tailwind CSS v4 · shadcn/ui (`radix-nova`) ·
react-hook-form + zod · @tanstack/react-table v9 · recharts · next-themes · sonner

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use the **Login** page to pick one of 5 simulated roles:
principal, academic incharge, HOD, teacher, student. No password — this is a demo session
stored in `localStorage`; reset it any time from `/admin/settings` (principal role).

## Scripts

| Command                  | Purpose                                                          |
|---------------------------|--------------------------------------------------------------------|
| `npm run dev`             | Start the dev server (Turbopack)                                  |
| `npm run build`           | Production build — verifies all routes compile                    |
| `npm run typecheck`       | `tsc --noEmit`                                                     |
| `npm run lint`            | ESLint                                                             |
| `npm run check-seed`      | Validates the seed dataset (no duplicate rolls, dangling refs, routine conflicts) |
| `npm run check-workflows` | Exercises result/attendance/promotion workflows against the mock services |

Re-run `check-seed` and `check-workflows` after any edit to `src/mocks/seed/` or
`src/services/mock/`.

There's also a Playwright smoke test at `scripts/smoke-test.mjs` (summary written to
`scripts/smoke-summary.json`) that clicks through the core flows for each role.

## Project layout

```
src/
  types/                domain models
  lib/i18n/              bn/en dictionary + provider + formatters
  lib/permissions/       role-permission matrix + can() helper
  lib/validation/        zod schemas
  lib/grading.ts         illustrative grade/GPA utility (not BTEB-verified, labeled in UI)
  services/contracts/    typed service interfaces
  services/mock/         mock implementations (reads mocks/seed, persists via mocks/storage)
  services/api/          documented HTTP adapter boundary (stub, not wired)
  mocks/seed/             deterministic fictional dataset
  mocks/storage/          versioned localStorage wrapper
  components/ui/          shadcn primitives
  components/shared/      cross-cutting reusable components
  components/domain/      feature-specific composite components
  app/(public)/...        public site (home, about, departments, notices, future-scope, login)
  app/portal/student/...  student portal
  app/portal/teacher/...  teacher portal
  app/admin/...           admin/principal/HOD dashboard (14 routes)
```

## Key decisions

- **Demo session**: client-side mock only, stored in `localStorage`, labeled "simulated"
  everywhere it's shown.
- **Grading/GPA** (`lib/grading.ts`) is explicitly illustrative, not verified against BTEB rules.
- **Result workflow**: Draft → Submitted → Verified → Published. Teachers draft/submit, HOD
  verifies or returns with a reason, Principal publishes. Students only ever see Published.
- **Future-phase registry** (`/future`): online admission, fee payment, SMS/email notifications,
  digital ID cards, mobile app, etc. are listed as planned scope, not built as working features.

See `PROGRESS.md` for the complete decision log, task-by-task build history, and notes on
framework gotchas encountered along the way (TanStack Table v9 API, React Compiler lint rules,
Server→Client prop constraints).

## Resuming work

If you're picking this project back up, read `PROGRESS.md` first — it's the resumable source
of truth for what's done, what's left, and why specific choices were made.

## Developer / Contact

Built by **Wahed Nur** — web developer working primarily with Next.js/React/TypeScript.

- Website: [wahednur.tech](https://www.wahednur.tech/)
- Email: wahednur@gmail.com

**Recent work:** [ekhaneikini.com](https://ekhaneikini.com/) — a bilingual (Bengali/English)
e-commerce marketplace for Bangladesh ("Bangladesh's online superstore, est. 2016"), built on
Next.js with SSLCommerz payment integration, a 24+ category product catalog, user accounts with
wishlists/order tracking, and an accompanying Android app. This EMIS prototype is a current,
separate project.

Open to freelance/contract work — reach out via the website or email above.
