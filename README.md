# FaceTrack — Attendance Intelligence System

FaceTrack is the frontend console for a face-recognition attendance system —
a single dashboard for tracking check-ins, managing the employee roster,
reviewing attendance history, and exporting reports.

## ✨ Purpose

- 📊 **Dashboard** — live presence, punctuality trends, and hourly check-in activity at a glance.
- 🧾 **Attendance records** — searchable, filterable daily logs with bulk actions.
- 👥 **Employee management** — roster, profiles, and face enrollment.
- 📈 **Reports** — built and saved aggregate reports, exportable on demand.
- 🌗 **Light / dark themes** — instant, flash-free theme switching.
- 📱 **Responsive** — real component swaps (not just CSS) below 900px.

## 🛠️ Tech stack

|                               |                                                  |
| ----------------------------- | ------------------------------------------------ |
| ⚛️ **React 19**               | UI library                                       |
| ▲ **Next.js 16** (App Router) | Routing, server + client composition             |
| 🟦 **TypeScript**             | End-to-end type safety                           |
| 🎨 **Tailwind CSS 4**         | Styling, design tokens                           |
| 🔄 **TanStack Query**         | Server state, caching, mutations                 |
| 🌐 **Axios**                  | HTTP client                                      |
| ✅ **Zod**                    | Runtime schema validation for every API response |
| 🧹 **ESLint**                 | Linting                                          |
| 🎯 **Lucide**                 | Icon set                                         |

## 🚀 Getting started

Clone the repo and install dependencies:

```bash
git clone <repository-url>
cd facial-recognition
npm install
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign in with any
well-formed email and a password of 4+ characters.

## 📜 Scripts

```bash
npm run dev       # start the dev server
npm run build     # production build
npm start         # run the production build
npm run lint      # lint the codebase
```

## 🏗️ Architecture

Feature-first (domain-driven). Each business domain is a self-contained
vertical slice — routes are created first, then the feature's own UI
components, then wired into the page last. Nothing reaches across into
another feature's internals.

```
src/
├── app/                        App Router — routing and composition only
│   ├── (auth)/                 sign-in, forgot-password (split-screen shell)
│   ├── (console)/              guarded routes (sidebar + topbar shell)
│   │   ├── dashboard/
│   │   ├── attendance-records/
│   │   ├── employees/
│   │   ├── reports/
│   │   └── employee-profile/[employeeId]/
│   ├── api/                    API route handlers
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
│       ├── hooks/               TanStack Query wrappers
│       ├── lib/                 domain rules
│       └── components/          feature UI, composed by a *View
│
├── shared/                     cross-cutting, domain-agnostic
│   ├── api/                    axios client, query keys, query client
│   ├── config/                 routes, nav items, app constants
│   ├── hooks/  lib/  theme/    utilities and theme store
│   ├── types/                  shared primitives
│   └── ui/                     design-system kit
│
└── server/                     API data source
    ├── data/                   seed data
    └── lib/                    store, response + pagination helpers
```

**Rules that keep it honest**

- `app/` holds no business logic — pages import a feature's `*View` and nothing else.
- Features never import another feature's `api/` or `types.ts`. Shared concepts
  live in `shared/types`.
- Every sidebar destination is its own route, so deep links and the back button work.
- `shared/ui` knows nothing about attendance.

## 🔄 Data layer

Every server read and write goes through TanStack Query.

- `shared/api/client.ts` — one axios instance; `getValidated` / `postValidated`
  parse each response through its zod schema, so a backend contract change
  surfaces at the boundary rather than as `undefined` deep in a chart.
- `shared/api/query-keys.ts` — one key factory, so invalidation can't miss a cache entry.
- Mutations invalidate across features where a write genuinely moves other numbers
  (adding, removing employees)
- Loading and error states are real: skeletons while pending, retry affordance on
  failure, `placeholderData` so filtering never blanks a table.

## 🎨 Design system

Tokens in `src/app/globals.css` define colours, type scale, spacing, radii,
elevation, and motion. Dark mode overrides tokens only, under
`[data-theme="dark"]` — an inline script in `<head>` stamps the stored theme
before first paint, so there's no flash on load.

Charts are hand-built SVG/CSS against the same tokens — no charting dependency.

## 📐 Layout

The console shell owns the viewport: it is exactly `100dvh` and never scrolls
itself. The sidebar is pinned at full height and the content column is the
only scroll container, so navigation stays reachable however long a page
gets. The topbar sticks to the top of that column.

## 📱 Responsive behaviour

The 900px breakpoint drives real component swaps, not just CSS:

- Sidebar → slide-over drawer
- Attendance table → one card per employee
- Auth brand panel hides; a compact header takes its place
