# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # Start dev server (loads .env via scripts/dev.mjs, then runs next dev)
pnpm build          # Production build
pnpm start          # Production start (loads .env via scripts/dev.mjs)
pnpm lint           # ESLint
pnpm db:push        # Push schema to database (no migration files)
pnpm db:generate    # Generate migration SQL from schema
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed database (tsx scripts/seed.ts)
pnpm db:studio      # Open Drizzle Studio GUI
```

**Important:** Always use `pnpm dev` / `pnpm start`, never `next dev` / `next start` directly — the wrapper script loads `.env` via dotenv first.

## Tech Stack

Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4, Drizzle ORM, Neon Postgres (serverless), NextAuth v5 beta (credentials + JWT), React 19 with React Compiler, zod v4, Google Cloud Storage for media.

## Architecture

### Routing

- `src/app/(public)/` — Public pages wrapped with Navbar + Footer layout
- `src/app/admin/(dashboard)/` — Auth-protected admin CMS with sidebar layout
- `src/app/api/` — API routes (contact form, upload, config, etc.)
- `src/middleware.ts` — Protects `/admin/*` routes (except `/admin/login`)

### Data Layer

- `src/db/index.ts` — Lazy Neon connection via `getDb()`. Returns `null` if `DATABASE_URL` not set.
- `src/db/schema.ts` — Drizzle tables: `site_config`, `page_sections`, `stats`, `initiatives`, `leadership`, `partners`, `users`, `sessions`, `contact_submissions`
- `src/lib/queries.ts` — Public queries with fallback data when DB unavailable
- `src/lib/admin-queries.ts` — Admin queries (throws if DB not configured)
- `src/lib/admin-actions.ts` — Server actions (`"use server"`), all gated by `requireAuth()`

### Components

Server Components by default. Client components (`"use client"`) only for: `AnimatedCounter`, `ContactForm`, `Navbar` (mobile toggle), `ScrollReveal`, and all admin `*Manager.tsx` / form components.

- `src/components/layout/` — Navbar, Footer
- `src/components/ui/` — Public UI components
- `src/components/admin/` — Admin CRUD components, `EntityForm` (generic form modal), `ImageUploadField` (GCS upload)

### GCS Upload Flow

GCS credentials are stored in the `site_config` DB table (not env vars), configured via admin Settings UI. Upload: client calls `POST /api/upload` for a signed URL, then PUTs directly to GCS.

## Key Conventions

- **Zod imports:** Always `import { z } from "zod/v4"` — never `"zod"` directly
- **DB access:** Always via `getDb()` from `@/db` — never instantiate directly
- **Public pages:** Must handle `getDb()` returning `null` with fallback data
- **Server actions:** Always call `requireAuth()` first, then `revalidatePath()` after mutations
- **Path alias:** `@/` maps to `src/` — use it everywhere
- **Tailwind v4:** No `tailwind.config.ts`. All theme tokens live in `src/app/globals.css` under `@theme inline` as CSS custom properties (e.g., `--paa-midnight`, `--paa-accent`)
- **Fonts:** Barlow Condensed (headings via `--font-barlow`), Source Serif 4 (body via `--font-source-serif`), JetBrains Mono (data via `--font-jetbrains`)
- **Color palette:** Blue aviation theme — midnight `#0c1a2e` (bg), navy `#132b4a` (cards), accent `#2d6eb5` (CTA), sky `#7ab8e0` (secondary), white `#f0f6fc` (text), gray `#8da4bf` (muted)
- **Display ordering:** `orderIndex` integer field on all list entities; lower = first

## Environment

Required in `.env` (see `.env.example`):
- `DATABASE_URL` — Neon Postgres connection string
- `NEXT_PUBLIC_SITE_URL` — Public URL
- `PORT` — App port (default 3000)
- `AUTH_SECRET` — Generate with `npx auth secret`

## Deployment

Docker (`output: "standalone"`) or bare-metal with PM2. Configs in `infra/` (nginx, PM2 ecosystem, certbot). See `DEPLOYMENT.md` for the full manual installation guide.
