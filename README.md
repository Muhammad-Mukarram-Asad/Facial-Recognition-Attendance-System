# FaceTrack — Attendance Intelligence System

FaceTrack is the frontend console for a face-recognition attendance system —
a single dashboard for tracking check-ins, managing the employee roster,
reviewing attendance history, and exporting reports.

## ✨ Purpose

- 📊 **Dashboard** — one day's attendance analytics (present, absent, late, strangers, blacklisted, total employees, enrolled faces), the live gate as the recent-attendance grid, and a check-in-times chart for the last 24 hours. A gate photo opens in a dialog in the center of the screen.
- 🧾 **Attendance records** — one day's register, searchable, and filterable by present, absent, or blacklisted. Late and early departure stay columns; they are not status filters. Export DAT downloads the TIS machine file for the employees who were present that day. Each row shows the employee's photo; clicking it opens the same dialog.
- 👥 **Employee management** — roster, profiles, and face-photo enrollment. Create requires a full name, attendance code, employee code, and a face photo. Department, designation, division, status, joining date, and shift times are optional. Name and both codes lock after create. The directory shows the stored enrollment photo, and initials when none is stored.
- 🔐 **Session** — a sign-in lasts two hours. Expiry, or a rejected token, signs the console out and returns to sign-in. Reloads do not extend that deadline.
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

These are the integrations the console uses against the FaceTrack backend.

- **Dashboard analytics** — `GET /attendance/analytics-today` for the picked calendar day. The timestamp is noon in Asia/Karachi, so the numbers stay on the day the user chose.
- **Live gate feed** — the recent-attendance card is the live gate. `GET /attendance/events` loads the last 24 hours, then `GET /attendance/stream` appends new frames. The stream client is `EventSourcePolyfill` so the request can carry the Authorization header. A pill on the card reads Live while that stream is connected, and Reconnecting while it is not. Events older than 24 hours drop off. Unknown people arrive with employee id `0` and each capture stays its own row. Each known person also carries `employee_status` (active, inactive, blacklisted, or vip); strangers have none, so no badge is shown. VIP arrivals use a red-tinted tile. Gate photos are prefixed with the server-assets base. Clicking a thumbnail opens a dialog with the full capture, name, entry or exit, gate, and time. The card shows the 12 newest events in four columns on a laptop or desktop (viewport at least 901px). Narrower screens show the 9 newest: three columns from 560px, two below that, so each face stays recognizable.
- **Check-in times** — the same last-24-hour feed, counted by hour. Exits and unknown people are left out, so the bars are employee arrivals. The card names the peak hour. An empty window says there were no check-ins.
- **Attendance register** — `GET /attendance/attendance-full` for one day. The timestamp is the picked calendar day, the current UTC clock, and a `+05:00` offset. The API adds those five hours, so the instant is read in Asia/Karachi. Status chips are All, Present, Absent, and Blacklisted. Present and absent go out as `status`. Blacklisted is the workforce `employee_status`, which that endpoint does not filter, so the console applies it to the full day's rows. Late and early departure stay columns on each row. Search runs on the loaded rows. **Export DAT** calls `GET /attendance/generate-dat` for that same timestamp and downloads `attendance-YYYY-MM-DD.dat`. The body is plain text, one fixed-width line per check-in (`0001`) or check-out (`0002`) of each present employee, joined with CRLF for TIS and payroll software. A day with nobody present shows an error toast. Each record includes `image_path`: the day's first entry capture, or the employee's enrollment photo when that capture is missing. The row shows that image beside the name. If the register has no path, the console uses the roster `photo_path`. Clicking the photo opens the same dialog, with status, department, and check-in time. Initials stay when neither image exists or the file fails to load.
- **Employees** — create sends the profile as `employee_data` and a face photo together. The full name is `full_name`. Attendance code and employee code are required and, with the name, are locked on edit. Department and designation are optional ids. Choosing Other on either picker asks for a name and creates it with `POST /departments` or `POST /designations` before the employee is saved. Division is RIJA FASHIONS 1 or RIJA FASHIONS 3, or blank. Status is active, inactive, blacklisted, or vip. Shift start and end are 24-hour `HH:MM`, sent together or not at all; the backend resolves the shift, so `shift_id` is never sent. `is_active` is false only for inactive on create. On update, active and inactive set it, and blacklisted and vip leave it unchanged. The enrollment photo is sent only on create. The upload button shows a spinner until the file dialog appears. Delete is a soft delete (`is_active` false, `deleted_at` set); the directory omits those records. Stored photo keys are prefixed with the server-assets base so the browser can load them. The employee directory renders `photo_path` in place of the initials avatar, and keeps the initials when the path is empty or the image fails.
- **Departments and designations** — loaded once a session exists, then used as the pickers on the employee form. New names added from Other join that same list. The shifts catalog is not requested; shift times are typed on the form.
- **Session** — the token cookie and a saved profile last two hours from sign-in. Reloads do not extend that deadline. When it passes, including after a backgrounded tab comes forward, the console signs out. Parallel 401s navigate to sign-in once.

## 🎨 Design system

Tokens in `src/app/globals.css` define colours, type scale, spacing, radii,
elevation, and motion. Dark mode overrides tokens only, under
`[data-theme="dark"]` — an inline script in `<head>` stamps the stored theme
before first paint, so there's no flash on load.

Charts are hand-built against the same tokens. The check-in card is a row of hour bars, with no charting dependency on that screen.

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
