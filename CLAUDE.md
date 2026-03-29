# CLAUDE.md — Badelz Project

## Project Overview
Badelz (بادلز) is Egypt's padel court booking PWA. Arabic-first, mobile-first, dark-themed with the BALADI design system. Players book courts without an account (name + phone). Venue owners manage listings via dashboard. Domain: badelz.app

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database**: PostgreSQL 16 (Docker local / Neon production) + Prisma ORM v6
- **Auth**: NextAuth.js v4 with credentials (venue owners only)
- **Styling**: Tailwind CSS 4 + BALADI design system (dark, flat, no glassmorphism)
- **Animations**: Framer Motion (minimal — only `stepFade` and `checkmarkDraw` exports)
- **Icons**: lucide-react
- **i18n**: Custom AR/EN with RTL support (Arabic-first)
- **Analytics**: PostHog
- **PWA**: Serwist (service worker), web manifest, installable
- **Fonts**: Cairo (body), Lalezar (display AR), Anton (display EN)

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
npm run test:e2e     # Run Playwright e2e tests
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

### BALADI Design Tokens
```
Background:   #0d0d0d    (--bg-primary)
Surface:      #1a1a1a    (--bg-secondary)
Tertiary:     #222222    (--bg-tertiary)
Accent lime:  #d4ff00    (--accent-primary)      — CTAs, venues, active states
Accent red:   #ff4d4d    (--accent-secondary)    — live/urgent, lobbies
Accent blue:  #00c2ff    (--accent-tertiary)     — coaches, info
Text primary: #ffffff    Text secondary: #999999   Text muted: #666666
Border:       #333333    Border inner: #222222
```

### Typography
- **Body**: Cairo (`font-sans`) — Arabic + Latin
- **Display AR**: Lalezar — `font-[family-name:var(--font-display-ar)]`
- **Display EN**: Anton — `font-[family-name:var(--font-display-en)]`

### Surface Treatment
- Cards: `bg-[#1a1a1a] rounded-sm` — NO glassmorphism, NO backdrop-blur, NO bg-white/X
- Left-border accents: `border-s-[3px] border-s-[#d4ff00]` (venues), `border-s-[#ff4d4d]` (live), `border-t-[#00c2ff]` (coaches)
- Featured blocks: `bg-[#d4ff00] text-[#0d0d0d]` (inverted lime)
- Section dividers: `h-[3px]` colored bars (lime/red/blue per section)
- Only `rounded-full` on avatars. Everything else `rounded-sm`

### Buttons
- Primary: `bg-[#d4ff00] text-[#0d0d0d] rounded-sm` (or `.btn-primary`)
- Secondary: `border border-[#333] text-[#999] rounded-sm` (or `.btn-outline`)
- NO rounded-full buttons. NO gradient buttons.

### Component Patterns
- Bottom nav: `bg-[#0d0d0d] border-t-2 border-[#333]`, lime top-bar on active tab
- Header: `bg-[#0d0d0d] border-b-2 border-[#333]`, solid (no blur)
- Inputs: `bg-[#1a1a1a] rounded-sm border-2 border-[#333] focus:border-[#d4ff00]`
- Chips: Active = `bg-[#d4ff00] text-[#0d0d0d] rounded-sm` / Inactive = `border border-[#333] text-[#999] rounded-sm`
- Status badges: `rounded-sm` (confirmed=lime, pending=yellow, cancelled=red)

### Animation Rules
- `src/lib/animations.ts` exports ONLY `stepFade` (booking flow) and `checkmarkDraw` (confirmation)
- Tap feedback: CSS `active:scale-[0.97] transition-transform duration-75`
- Live indicators: CSS `animate-pulse` only
- NO stagger, NO scroll-reveal, NO hover-float, NO glow effects

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
