# Badelz Launch Checklist

## Pre-Launch: Production Environment Verification

### Vercel Environment Variables

| Variable | Status | Risk if Missing |
|----------|--------|-----------------|
| `DATABASE_URL` | [ ] Verify points to Neon production | App won't start |
| `NEXTAUTH_SECRET` | [ ] Not "dev-secret-change-in-production" | JWT signing compromised |
| `NEXTAUTH_URL` | [ ] Set to `https://badelz.app` | Auth callbacks break |
| `NEXT_PUBLIC_POSTHOG_KEY` | [ ] Set from PostHog project | **Zero analytics -- flying blind** |
| `NEXT_PUBLIC_POSTHOG_HOST` | [ ] Set (default: `https://us.i.posthog.com`) | PostHog may use wrong region |
| `RESEND_API_KEY` | [ ] Valid key + domain verified in Resend | No email notifications |
| `RESEND_FROM_EMAIL` | [ ] Set to `Badelz <bookings@badelz.app>` | Emails fail |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | [ ] Production keys generated | Push notifications won't work |
| `VAPID_PRIVATE_KEY` | [ ] Matches public key | Push notifications won't work |
| `VAPID_SUBJECT` | [ ] Set to `mailto:admin@badelz.app` | Push may be rejected |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | [ ] Set if marketplace photos needed | Falls back to URL input only |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | [ ] Set if marketplace photos needed | Falls back to URL input only |

### Functional Checks (Test on Mobile over 4G)

- [ ] `badelz.app` loads in < 3 seconds
- [ ] Full booking flow: Browse -> Venue -> Court -> Book (name + phone) -> Confirmation
- [ ] Lobby: Create -> Copy share link -> Open in incognito -> Join
- [ ] Marketplace: Create listing with photo upload
- [ ] PWA: "Add to Home Screen" prompt appears in Chrome
- [ ] Share `badelz.app` on WhatsApp -- OG image preview renders correctly
- [ ] Owner login works (NOT using `password123` in production!)
- [ ] Push notification permission prompt appears after booking
- [ ] Arabic is default language, RTL layout correct
- [ ] English toggle works

### Database

- [ ] Latest migrations applied (including `add_lobby_level`, `add_game_level`)
- [ ] At least 3 venues with plausible data visible
- [ ] Demo password `password123` changed or removed in production

---

## Pre-Launch: Content Assets

- [ ] 5 Arabic UI screenshots taken on real phone:
  1. Discover/home feed
  2. Venue detail with courts
  3. Booking form
  4. Lobby page
  5. Marketplace
- [ ] Social media accounts ready (Instagram, Facebook Page, TikTok)
- [ ] Member of all target Facebook groups (approval can take days!)
- [ ] WhatsApp broadcast list built (20-30 padel friends)
- [ ] Following 15-20 padel venue Instagram accounts (engage for 2-3 days before DMs)

---

## UTM-Tagged Links (Copy-Paste Ready)

### Facebook Groups
```
Padel Egypt:        https://badelz.app?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=padel_egypt
New Cairo:          https://badelz.app?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=new_cairo
Sheikh Zayed:       https://badelz.app?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=sheikh_zayed
Padel Cairo:        https://badelz.app?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=padel_cairo
Looking for Players:https://badelz.app?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=lfp
University:         https://badelz.app?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=university
Compounds:          https://badelz.app?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=compound
```

### Lobby Page (Facebook)
```
https://badelz.app/play?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=lobby
```

### WhatsApp
```
https://badelz.app?utm_source=whatsapp&utm_medium=message&utm_campaign=launch
```

### Instagram
```
Story:    https://badelz.app?utm_source=instagram&utm_medium=story&utm_campaign=launch
Venue DM: https://badelz.app?utm_source=instagram&utm_medium=dm&utm_campaign=venue_outreach
```

### Marketplace (Facebook/WhatsApp)
```
https://badelz.app/market/sell?utm_source=facebook&utm_medium=group&utm_campaign=launch&utm_content=marketplace
```

---

## Day-by-Day Execution (7 Days)

> Arabic copy for all posts, DMs, and stories is in `BADELZ-LAUNCH-PLAN-MARCH-2026.md`

### Day 1: Soft Launch
**Morning (9-10am)**
- [ ] Send WhatsApp broadcast (Version A -- full feature message)
- [ ] Ask 3-5 close friends to try the full flow, give voice-note feedback
- [ ] Post personal Instagram Story 1 (launch announcement)

**Afternoon (2-4pm)**
- [ ] Post Version A ("I Built This" story) in main Padel Egypt Facebook group
- [ ] Post Version C (lobby hook) in "looking for players" group
- [ ] Reply to every comment within 30 minutes

**Evening (8-10pm)**
- [ ] Check PostHog: visitors, referrer breakdown, drop-off points
- [ ] Fix any bugs found by early users (prioritize booking flow)
- [ ] Send personal WhatsApp thank-you to anyone who booked or created a lobby

**Target: 30-50 visitors, 3-5 bookings, 1-2 lobbies**

---

### Day 2: Area Groups + Venue Outreach
**Morning (9-11am)**
- [ ] Post Version B (short/punchy) in New Cairo Facebook group
- [ ] Post Version B in Sheikh Zayed Facebook group
- [ ] Instagram Story 2 (lobby feature)
- [ ] DM 5 venue owners on Instagram (cold DM Version A)
  - Priority: venues with "Book via WhatsApp" in bio

**Afternoon**
- [ ] Engage helpfully in Facebook groups -- answer questions, NO link-dropping
- [ ] Follow up with anyone who commented on Day 1 posts

**Evening**
- [ ] Review PostHog session recordings (watch 3-5 real user sessions)

**Target: 50-80 cumulative visitors, 5-8 bookings, first venue conversation**

---

### Day 3: Content + Social Proof
**Morning**
- [ ] Post Story 4 (social proof with early stats, even if small)
- [ ] Share "build in public" story (PostHog dashboard screenshot or code)
- [ ] Post in 1-2 more Facebook groups

**Afternoon**
- [ ] DM 5 more venue owners
- [ ] Follow up on Day 2 DMs (Version C follow-up for non-responders)
- [ ] If any venue responded positively: add their data to platform immediately

**Evening**
- [ ] Instagram Story 3 (pain point: "still booking on WhatsApp in 2026?")

**Target: 100+ cumulative visitors, 10+ bookings, 1 confirmed venue**

---

### Day 4 (Thursday): THE LOBBY PUSH
> Thursday = Egyptians plan weekend padel. Highest-leverage day.

**Morning**
- [ ] Create 2-3 real lobbies for Friday/Saturday in popular areas
- [ ] Post lobby links in Facebook groups (this is USING the product, not selling it)

**Afternoon**
- [ ] DM 5 more venue owners
- [ ] Post Version B in 1-2 general sports groups

**Evening**
- [ ] Share lobby links in WhatsApp groups with real invitation

**Target: 150+ cumulative visitors, 15+ bookings, 5+ lobbies created**

---

### Day 5 (Friday): Game Day
**Morning/Afternoon**
- [ ] Post in university sports groups (GUC, AUC, BUE)
- [ ] Instagram Story 5 (marketplace)
- [ ] If lobbies filled: screenshot and share the success

**Evening**
- [ ] Post video story from padel court thanking early users
- [ ] DM coaches: offer free directory listing

**Target: 200+ cumulative visitors, 20+ bookings, 1 coach profile**

---

### Day 6 (Saturday): Compounds + Marketplace
**Morning**
- [ ] Post Version B in compound Facebook groups (Rehab, Madinaty, Palm Hills, Sodic)
- [ ] Separate marketplace post: "Anyone have a used padel racket to sell?"

**Afternoon**
- [ ] Follow up on ALL venue DMs from the week
- [ ] Send thank-you messages to every person who booked or created a lobby
- [ ] Ask 2-3 active users for feedback via voice note

**Evening**
- [ ] Plan Week 2 content based on what worked

**Target: 250+ cumulative visitors, 25+ bookings, 2 venues confirmed**

---

### Day 7 (Sunday): Reflect
**Morning**
- [ ] Compile Week 1 numbers
- [ ] Post honest stats to Instagram/Facebook (transparency > vanity)
- [ ] Thank-you post in main Padel Egypt group (not promotional)

**Afternoon**
- [ ] Write down: what worked, what didn't, which channel drove most engaged users
- [ ] Plan Week 2: double down on winning channel

---

## Week 1 Success Benchmarks

| Metric | Minimum | Good | Great |
|--------|---------|------|-------|
| Unique Visitors | 150 | 300 | 500+ |
| Bookings Made | 10 | 25 | 50+ |
| Lobbies Created | 5 | 15 | 30+ |
| Venue Owner Conversations | 3 | 8 | 15+ |
| Venues Confirmed/Listed | 1 | 3 | 5+ |
| Coach Profiles | 0 | 2 | 5+ |
| Marketplace Listings | 0 | 5 | 10+ |
| PWA Installs | 5 | 15 | 30+ |

## PostHog Alarm Thresholds

| Metric | Alarm If Below | Meaning |
|--------|---------------|---------|
| Booking completion rate | < 5% of visitors | Booking flow has friction |
| Browse-to-venue-view | < 30% of homepage visitors | Homepage not compelling |
| Venue-view-to-booking-start | < 40% | Venue pages not convincing |
| Booking start-to-complete | < 60% | Form too complex |
| Lobby share rate | < 20% of creators | Share UX is buried |
| Day 3 return rate | < 15% | No reason to come back |

---

## Week 2-4 Priorities

**Week 2**: Add Sentry error tracking, analyze PostHog ruthlessly, convert warm venue leads, coach outreach
**Week 3**: Create community WhatsApp group, weekly lobby roundups, referral asks
**Week 4**: User testimonials, TikTok/Reels if Instagram worked, evaluate: on track for 10 venues / 50 active users?
