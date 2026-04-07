# ścieżka

Social travel network for Belarus. Users can mark points on a map, create routes, leave reviews, and share their journeys.

## 📅 What was done today (2026-04-07)

### Rebranding: Scežka → ścieżka
- Renamed all user-facing text, metadata titles, and `.cursorrules` heading from "Scežka" to "ścieżka"
- Updated login page ("Sign in to your ścieżka account") and register page ("Join ścieżka and start sharing your journey")
- Updated `<title>` in root layout and auth layout

### Font
- Replaced Geist Sans / Geist Mono with **Inter** from `next/font/google`
- Applied as `--font-inter` CSS variable; wired into Tailwind via `--font-sans` and `--font-heading`

### Color palette & theming
- Replaced default shadcn/ui `oklch` neutral palette with a resort-inspired earthy-green scheme (light + dark)
- Light mode: warm cream background, forest-green primary, muted olive accents
- Dark mode: deep green surfaces, low-contrast neutral text, matching sidebar tokens

### Dark mode
- Added `next-themes` dependency
- Created `ThemeProvider` client component wrapping `NextThemesProvider`
- Wrapped app in `ThemeProvider` inside `Providers` (default: system preference)
- Created `ThemeToggle` button (Sun/Moon icons) with `mounted` guard to prevent hydration mismatch
- Added `ThemeToggle` to `Navbar`; added `suppressHydrationWarning` to `<html>`

### Stage 2: Maps & Points (completed)
- Replaced homepage map placeholder with a live interactive Yandex map (`BelarusMap`)
- `HomeMap` client wrapper uses `next/dynamic` with `ssr: false` to avoid SSR restriction
- `usePoints` TanStack Query hook — fetches markers from Supabase, parses PostGIS geography (GeoJSON + WKT)
- `useCreatePoint` mutation — inserts point via `SRID=4326;POINT(lng lat)`, invalidates cache on success
- `AddPointDialog` — opens on map click, collects title / description / region, validates input
- Markers rendered as `Placemark` with hint + balloon content from Supabase data
- Auth gate: signed-out users can browse markers; adding points shows a sign-in prompt
- `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` wired through `YMaps query` prop; missing-key warning badge shown in UI
- Added Yandex Maps API key entry to `.env.local.example` with setup instructions

## Tech Stack
- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + PostGIS)
- Yandex Maps API
- Zustand + TanStack Query

## Development Plan (5 stages)

### Stage 1: Fundamentals (Days 1-3) ✅
- Project setup, Supabase, auth, basic UI

### Stage 2: Maps & Points (Days 4-6)
- Yandex Maps integration, add points, display markers

### Stage 3: Social Features (Days 7-10)
- Feed, profiles, comments, likes

### Stage 4: Killer Feature – Route Builder (Days 11-14)
- Create routes, filter by region/duration, algorithm for optimal path

### Stage 5: Polish & Deploy (Days 15-17)
- Responsive design, SEO, Vercel deployment

## Setup Instructions
1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in Supabase credentials
3. Run `npm install`
4. Run `npm run dev`

### Optional map key
For full Yandex Maps functionality, set this in `.env.local`:
```
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=your_yandex_maps_api_key
```

## For Google OAuth
Enable the Google provider in Supabase Dashboard → Authentication → Providers, then add your Google Client ID and Secret. The authorized redirect URI to register in Google Cloud Console is:
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

## Progress Log

### Day 1 – Project bootstrap
- Next.js 15 + TypeScript strict, Tailwind CSS, shadcn/ui
- Supabase clients (`client.ts`, `server.ts`, `middleware.ts`) with env validation
- TanStack Query provider, ESLint + Prettier configured
- `.cursorrules` with project conventions

### Day 2 – Database schema & Auth
- Applied full PostgreSQL schema via Supabase MCP:
  - PostGIS extension enabled
  - Tables: `profiles`, `points`, `routes`, `route_points`, `follows`, `likes`, `comments`
  - GiST index on `points.location` for PostGIS geo queries
  - RLS enabled on all tables with owner-only write policies
  - Trigger `handle_new_user()` auto-creates a profile on every signup (supports Google OAuth metadata)
  - `updated_at` triggers on mutable tables
- Generated TypeScript types from Supabase into `database.types.ts`
- Auth server actions: `signInWithEmail`, `signUpWithEmail`, `signInWithGoogle`, `signOut`
- Login page (`/login`) and Register page (`/register`) with shadcn/ui Card layout
- Google OAuth support with `/auth/callback` route handler
- Zustand `useAuthStore` for client-side user state
- `Navbar` server component with auth-aware links and sign-out
- Dashboard page (`/dashboard`) shows user profile and placeholder stats
- Middleware redirects unauthenticated users from `/dashboard` to `/login`

### Day 3 – Stage 2 kickoff (Maps MVP)
- Replaced homepage placeholder with a client-only Yandex map (`next/dynamic` with `ssr: false`)
- Added TanStack Query hooks for points:
  - `usePoints()` to load markers
  - `useCreatePoint()` to insert new points and invalidate cache
- Added map click flow:
  - Click map to select coordinates
  - Open add-point dialog (title, description, region)
  - Save point and refresh markers
- Marker rendering:
  - Shows existing points from Supabase on the map
  - Uses title as hint and description in balloon
- Auth UX:
  - Signed-out users can view markers
  - Adding points is gated with a clear sign-in prompt
