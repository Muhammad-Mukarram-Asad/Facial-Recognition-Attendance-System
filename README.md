# FaceTrack — Attendance Intelligence System

FaceTrack is the frontend console for a face-recognition attendance system —
a single dashboard for tracking check-ins, managing the employee roster,
reviewing attendance history, and exporting reports.

## ✨ Purpose

- 📊 **Dashboard** — one day's attendance analytics (present, absent, late, strangers, blacklisted, enrolled faces), a live gate feed, and the newest check-ins. A gate photo opens in a dialog in the center of the screen.
- 🧾 **Attendance records** — one day's register, searchable, and filterable by present, absent, late, or early departure. Each row shows the employee's photo; clicking it opens the same dialog.
- 👥 **Employee management** — roster, profiles, face-photo enrollment, and designation and shift chosen from the backend. The directory shows the stored enrollment photo, and initials when none is stored.
- 🔐 **Session** — a sign-in lasts one hour. Expiry, or a rejected token, signs the console out and returns to sign-in.
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

Open [http://localhost:3001](http://localhost:3001) and sign in with an
account issued by the FaceTrack backend.

## 📜 Scripts

```bash
npm run dev       # dev server on port 3001
npm run build     # production build
npm start         # production server on port 3001
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
│   │   └── employee-profile/[employeeId]/
│   ├── globals.css             design tokens
│   └── layout.tsx
│
├── features/                   one folder per domain
│   ├── auth/         attendance/   dashboard/
│   ├── employees/    departments/  designations/
│   ├── profile/      shell/        shifts/
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

## 🔌 What the console calls

These are the integrations added after the console moved off dummy data.

- **Dashboard analytics** — `GET /attendance/analytics-today` for the picked calendar day. The timestamp is noon in Asia/Karachi, so the numbers stay on the day the user chose.
- **Live gate feed** — `GET /attendance/events` loads the last 24 hours, then `GET /attendance/stream` appends new frames. The stream client is `EventSourcePolyfill` so the request can carry the Authorization header. Events older than 24 hours drop off. Unknown people arrive with employee id `0` and each capture stays its own row. Gate photos are prefixed with the server-assets base. Clicking a thumbnail opens a dialog with the full capture, name, entry or exit, gate, and time. The recent card shows the 12 newest events in four columns on a laptop or desktop (viewport at least 901px). Narrower screens show the 9 newest: three columns from 560px, two below that, so each face stays recognizable. Those photos open the same dialog.
- **Attendance register** — `GET /attendance/attendance-full` for one day. Present and absent filter on `status`. Late and early departure also send `is_late` and `is_early_departure`. Search runs on the loaded rows. Each record includes `image_path`: the day's first entry capture, or the employee's enrollment photo when that capture is missing. The row shows that image beside the name. If the register has no path, the console uses the roster `photo_path`. Clicking the photo opens the same dialog, with status, department, and check-in time. Initials stay when neither image exists or the file fails to load.
- **Employees** — create sends the profile and a face photo together. Edit updates the profile. The enrollment photo is sent only on create. Stored photo keys are prefixed with the server-assets base so the browser can load them. The employee directory renders `photo_path` in place of the initials avatar, and keeps the initials when the path is empty or the image fails.
- **Designations and shifts** — loaded once a session exists, then used as the pickers on the employee form. Job title follows the chosen designation.
- **Session** — the token cookie and a saved profile last one hour from sign-in. Reloads do not extend that deadline. When it passes, including after a backgrounded tab comes forward, the console signs out. Parallel 401s navigate to sign-in once.

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
