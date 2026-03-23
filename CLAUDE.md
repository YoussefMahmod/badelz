# CLAUDE.md — Badelz Project

## Project Overview
Badelz (بادلز) is Egypt's padel court booking PWA. Arabic-first, mobile-first, dark-themed. Players book courts without an account (name + phone). Venue owners manage their listings via dashboard. Domain: badelz.app

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: PostgreSQL 16 (Docker local / Neon production) + Prisma ORM v6
- **Auth**: NextAuth.js v4 with credentials (venue owners only)
- **Styling**: Tailwind CSS 4 (dark theme, glassmorphism, mobile-first)
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **i18n**: Custom AR/EN with RTL support (Arabic-first)
- **PWA**: Web manifest, installable

## Common Commands
```bash
npm run db:up        # Start PostgreSQL container (port 5435)
npm run db:down      # Stop PostgreSQL container
npm run db:reset     # Destroy and recreate DB
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema changes (dev only)
npm run db:seed      # Seed test data
npm run db:studio    # Open Prisma Studio
npm run dev          # Start Next.js dev server
npm run build        # Build for production
```

## Quick Start
```bash
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

## Demo Login
- Email: owner@badelz.app
- Password: password123

## Code Conventions

### API Routes
- All under `src/app/api/`
- Return: `{ statusCode, message, data }`
- Validate with Zod (`src/lib/validators.ts`)
- Auth: `getServerSession(authOptions)` for protected routes

### Frontend
- Components in `src/components/`
- Arabic-first: all text via `useTranslation()` hook
- RTL: Use logical properties (ps/pe, ms/me, text-start/text-end)
- Mobile-first responsive design

### Design Tokens
- Background: `#0a0f1a`
- Cards: glass class or `bg-white/5 backdrop-blur-lg border border-white/10`
- CTA: `bg-gradient-to-r from-emerald-500 to-teal-500`
- Text primary: `text-white/90` | Secondary: `text-white/50`

### Database
- All IDs: cuid()
- Timezone: Africa/Cairo
- Currency: EGP
- Phone format: 01XXXXXXXXX (Egyptian)

## Architecture
- `(public)/` — Player-facing: browse, venue detail, booking flow (no auth)
- `(auth)/` — Login/register for venue owners
- `(owner)/` — Venue owner dashboard (protected)
- Players book without accounts (name + phone only)
- No payments in MVP — "pay at venue"
