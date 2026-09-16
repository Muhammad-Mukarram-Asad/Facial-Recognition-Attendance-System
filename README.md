# FaceTrack — Attendance Intelligence Console

Frontend for the JBS Omnivision / Lucky Textile Mills face-recognition attendance
system, built from the `FaceTrack Attendance.dc.html` design.

Next.js App Router · TypeScript · TanStack Query · Zod · Tailwind 4 baseline.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
```

Any well-formed email and a password of 4+ characters signs you in — the mock
auth route accepts them and issues a session token. There is no public sign-up;
accounts come from the backend team.

## Architecture

Feature-driven (domain-driven). Each business domain is a self-contained
vertical slice; nothing reaches across into another feature's internals.

```
src/
├── app/                        App Router — routing and composition only
│   ├── (auth)/                 sign-in, forgot-password (split-screen shell)
│   ├── (console)/              guarded routes           (sidebar + topbar shell)
│   │   ├── dashboard/
│   │   ├── attendance-records/
│   │   ├── employees/
│   │   ├── reports/
│   │   └── employee-profile/[employeeId]/
│   ├── api/                    mock backend (route handlers)
│   ├── globals.css             design tokens
│   └── layout.tsx
│
├── features/                   one folder per domain
│   ├── auth/         attendance/   dashboard/
│   ├── employees/    leave/        notifications/
│   ├── profile/      reports/      shell/
│   │
│   └── <feature>/
│       ├── types.ts            zod schemas + inferred types (the contract)
│       ├── api/                endpoint functions, validated responses
│       ├── hooks/              TanStack Query wrappers
│       ├── lib/                domain rules
│       └── components/         feature UI, composed by a *View
│
├── shared/                     cross-cutting, domain-agnostic
│   ├── api/                    axios client, query keys, query client
│   ├── config/                 routes, nav items, app constants
│   ├── hooks/  lib/  theme/    utilities and theme store
│   ├── types/                  shared primitives
│   └── ui/                     design-system kit
│
└── server/                     mock data source
    ├── data/seed.ts            roster, gate log, leave, notifications
    └── lib/                    in-memory store, response + pagination helpers
```

**Rules that keep it honest**

- `app/` holds no business logic — pages import a feature's `*View` and nothing else.
- Features never import another feature's `api/` or `types.ts`. Shared concepts
  live in `shared/types`.
- Every sidebar destination is its own route, so deep links and the back button work.
- `shared/ui` knows nothing about attendance.

## Data layer

Every server read and write goes through TanStack Query.

- `shared/api/client.ts` — one axios instance; `getValidated` / `postValidated`
  parse each response through its zod schema, so a backend contract change
  surfaces at the boundary rather than as `undefined` deep in a chart.
- `shared/api/query-keys.ts` — one key factory, so invalidation can't miss a cache entry.
- Mutations invalidate across features where a write genuinely moves other numbers
  (approving leave refreshes the leave list, the dashboard and the notification bell).
- Loading and error states are real: skeletons while pending, retry affordance on failure,
  `placeholderData` so filtering never blanks a table.

### Swapping in the real backend

The mock lives entirely under `src/app/api` and `src/server`. Point the client at
the production service and delete those two folders — no feature code changes:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://attendance.api.internal/v1
```

Endpoints the frontend expects:

| Method       | Path                                | Purpose                         |
| ------------ | ----------------------------------- | ------------------------------- |
| POST         | `/auth/sign-in`                     | session + user                  |
| POST         | `/auth/forgot-password`             | reset link (never enumerates)   |
| GET          | `/dashboard/overview?range=`        | headline metrics and charts     |
| GET          | `/dashboard/risk｜stream｜matrix`   | risk list, live feed, week grid |
| GET / PATCH  | `/attendance`                       | paged records / bulk status     |
| GET / POST   | `/employees`                        | roster / enroll                 |
| GET / DELETE | `/employees/{employeeId}`           | detail / remove                 |
| GET          | `/profile/{employeeId}`             | 30-day history and punches      |
| GET / POST   | `/reports/*`                        | aggregates, saved, export blob  |
| GET / PATCH  | `/notifications`, `/{id}`           | bell feed and read state        |

## Temporarily hidden

These are commented out, not deleted — every module, component and endpoint is
intact so each can be switched back on without rebuilding it.

| Hidden                        | Where to restore                                                   |
| ----------------------------- | ------------------------------------------------------------------ |
| Notification bell + panel     | `shell/components/Topbar.tsx`, `shell/components/ConsoleShell.tsx` |
| Attendance risk list          | `dashboard/components/DashboardView.tsx`                           |
| Pending-leave card            | `dashboard/components/DashboardView.tsx`                           |
| Probation count               | `dashboard/components/DashboardView.tsx` (Total employees subs)    |
| Leave count on "Absent today" | `dashboard/components/DashboardView.tsx`                           |
| Leave management (whole area) | `shared/config/routes.ts`, `app/(console)/leave-requests/page.tsx` |
| Break in / break out punches  | `server/data/seed.ts` → `recentPunches`                            |
| Self-service sign-up          | `app/(auth)/sign-up/page.tsx`, `auth/components/SignInForm.tsx`    |

`/sign-up` and `/leave-requests` are retired in `next.config.ts` via `redirects()`
— that runs before routing, so a direct hit never renders the console shell first.
Deleting the entry brings the route back.

Accounts are provisioned by the backend team, so sign-in is the only public entry
point. **Forgot password** (`/forgot-password`) is live and reports success
regardless of whether the address exists, so the form can't be used to enumerate staff.

## Design system

Tokens in `src/app/globals.css` are transcribed from the design — colours,
type scale, spacing, radii, elevation, motion, and the keyframes
(`ftFadeUp`, `ftScan`, `ftPulse`, `ftDrawLine`, …).

Dark mode overrides tokens only, under `[data-theme="dark"]`. An inline script in
`<head>` stamps the stored theme before first paint, and React subscribes to that
attribute via `useSyncExternalStore` — so there's no flash and no mount effect.

Charts are hand-built SVG/CSS against the same tokens: no charting dependency.

## Layout

The console shell owns the viewport: it is exactly `100dvh` and never scrolls
itself. The sidebar is pinned at full height and the content column is the only
scroll container, so navigation stays reachable however long a page gets. The
topbar sticks to the top of that column.

## Responsive behaviour

The 900px breakpoint from the design drives real component swaps, not just CSS:

- Sidebar → slide-over drawer
- Attendance table → one card per employee
- Auth brand panel hides; a compact header takes its place

## Scripts

```bash
npm run dev     npm run build     npm start     npm run lint
```
