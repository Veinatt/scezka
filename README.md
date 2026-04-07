# Scežka

Social travel network for Belarus. Users can mark points on a map, create routes, leave reviews, and share their journeys.

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

### Next: Day 3 – Stage 2 begins
- Yandex Maps dynamic import (client component)
- Display map centered on Belarus
- Add point modal (click map → fill form → save to Supabase PostGIS)
- Display saved points as markers
