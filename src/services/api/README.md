# services/api — HTTP adapter boundary (not wired up)

This directory is intentionally empty of implementation. It documents where
a real backend integration plugs in without touching feature code.

## Why this exists

Every feature (pages, forms, tables) calls the typed interfaces in
`services/contracts/*`, never `services/mock/*` directly by name — they get
their service instances from `services/index.ts`. Today that file points at
`services/mock`. Swapping to a real backend means:

1. Implement each contract in `services/contracts/*.ts` here, e.g.
   `services/api/student-service.ts`, calling `fetch`/your HTTP client
   against real REST endpoints instead of reading seeded arrays.
2. Change the exports in `services/index.ts` to point at `services/api`
   instead of `services/mock`.
3. Delete (or keep, for a future offline/demo mode) `services/mock` and
   `mocks/*`.

No component, page, or form should need to change — they only ever imported
the contract types and the `services/index.ts` instances.

## What does NOT transfer as-is

- `mocks/storage` (localStorage) — replaced by real HTTP session handling.
- `services/mock/session-service.ts` — replaced by real authentication
  (see README.md "Backend integration checklist" in the repo root).
- The illustrative grading scale in `lib/grading.ts` — must be replaced with
  verified BTEB calculation rules before production use.
- Client-side duplicate-roll/registration checks in
  `services/mock/student-service.ts` — these must be re-validated
  server-side; the client check is a UX nicety, never the source of truth.

## What transfers unchanged

- `services/contracts/*` (the interfaces themselves)
- `lib/validation/*` (zod schemas) — still useful for client-side UX
  validation even once the server is the source of truth
- `lib/permissions/*` — UI-level show/hide logic; still needs a
  server-side authorization check behind it
- Every component in `components/ui`, `components/shared`, `components/domain`
- Every page under `app/` — they call services, not storage, directly
