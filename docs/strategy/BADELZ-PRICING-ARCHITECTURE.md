# BADELZ PRICING ARCHITECTURE
## The Definitive Pricing & Monetization Blueprint (2026-2028)

**Date**: March 27, 2026
**Status**: Day 2 of Launch, Pre-Revenue
**Author**: Product Strategy
**For**: Youssef, Solo Founder

---

# EXECUTIVE SUMMARY

This document defines exactly what "free forever" means, what each tier includes, when tiers launch, and how grandfathering works. It is designed to be referenced for the next 2 years without ambiguity.

**Three critical principles:**
1. "Free forever" means the **specific features that exist today** remain free forever -- not every future feature.
2. Every tier must pass the **"Would I pay for this?"** test from the perspective of a Nasr City gym owner or a Thursday-night padel player.
3. Monetization starts from the **transaction layer** (convenience fees, deposits), NOT from gating existing features. Never take away what people already have.

---

# TABLE OF CONTENTS

1. [The Grandfathering Contracts](#1-the-grandfathering-contracts)
2. [Venue Pricing Tiers](#2-venue-pricing-tiers)
3. [Player Pricing Tiers](#3-player-pricing-tiers)
4. [Coach Pricing Tiers](#4-coach-pricing-tiers)
5. [Transaction-Based Revenue](#5-transaction-based-revenue)
6. [Pricing Psychology & Egypt Market Rules](#6-pricing-psychology--egypt-market-rules)
7. [Launch Timeline & Revenue Triggers](#7-launch-timeline--revenue-triggers)
8. [Revenue Projections by Tier](#8-revenue-projections-by-tier)
9. [FAQ & Edge Cases](#9-faq--edge-cases)

---

# 1. THE GRANDFATHERING CONTRACTS

This is the most important section. Read it before making any promise to any venue or coach.

## 1.1 Founding Venues (First 20)

**Promise**: "Free forever"
**What this actually means**:

### Included Forever (The "Founding Venue" Package):

| Feature | Description | Status |
|---|---|---|
| Venue listing on Badelz | Name, photos, location, courts, prices, hours | Built |
| Court management | Add/edit courts, set prices, manage availability | Built |
| Booking notifications | WhatsApp alerts for every new booking | Built |
| Booking management | View, confirm, cancel, complete bookings | Built |
| Manual booking creation | Add walk-in bookings to the calendar | Built |
| Basic dashboard | View upcoming bookings, today's schedule | Built |
| Venue settings | Edit info, upload cover photo | Built |
| QR code poster | Downloadable poster for reception area | Built |
| Game Link integration | Players create shareable booking links for their venue | Built |
| Lobby visibility | Venue appears in lobby (open games) listings | Built |

### NOT Included in "Free Forever" (Future Premium Features):

| Feature | Why It's Not Included | Tier It Belongs To |
|---|---|---|
| Analytics dashboard (revenue tracking, peak hours, player demographics, trends) | Does not exist yet. New value, new tier. | Business |
| Dynamic pricing engine (automated price suggestions based on demand) | Does not exist yet. Significant new capability. | Business |
| Featured/promoted placement in search results | Advertising product. Never promised as free. | Business or a la carte |
| WhatsApp marketing automation (bulk reminders, promotions to past bookers) | New communication channel beyond booking notifications. | Business |
| Multi-staff access (receptionist/manager logins) | New capability. Current = single owner login. | Business |
| Deposit collection from players (no-show protection) | Requires payment gateway. New infrastructure. | Business |
| Competitor benchmarking (pricing intelligence) | New analytics product. | Enterprise |
| API access (integrate Badelz with venue's own systems) | Enterprise-grade capability. | Enterprise |
| Branded booking page (white-label) | Premium customization. | Enterprise |
| Tournament hosting tools | Does not exist yet. | Business |
| Coach marketplace integration (venue as training location) | Does not exist yet. | Business |

### The Founding Venue Badge:
- Founding venues get a permanent "Founding Venue" badge displayed on their listing
- Badge copy: "شريك مؤسس | Founding Partner" with a shield/star icon
- This is a status symbol, not just a discount -- it signals trust and early adoption
- Badge appears on the venue card in browse results and on the venue detail page

### The Grandfathering Mechanism:
- Founding venues are identified by a `foundingVenue: true` flag in the database
- When premium tiers launch, founding venues see a dashboard banner: "As a Founding Partner, your current features remain free forever. Upgrade to unlock [new premium features] at 50% off."
- **Founding venues get 50% off any paid tier, forever.** This is generous enough to honor the spirit of "free forever" while still allowing upsell. A 999 EGP/month Business tier becomes 499 EGP/month for founding venues.
- If a founding venue never upgrades, nothing changes for them. They keep exactly what they have today, forever.

### How to Communicate This to Venues NOW:

Do NOT send a legal contract. Instead, when onboarding a founding venue, say:

> "كشريك مؤسس، كل اللي موجود دلوقتي في بادلز -- اللسيتنج، إدارة الكورتات، نوتيفيكيشنز الحجز، الداشبورد -- ده ليك مجانا على طول. لما نضيف features جديدة في المستقبل زي الـ analytics والـ dynamic pricing، هيبقى ليك خصم دائم عليها كشريك مؤسس."

Translation: "As a founding partner, everything currently on Badelz -- listing, court management, booking notifications, dashboard -- is free for you forever. When we add new features in the future like analytics and dynamic pricing, you'll get a permanent founding partner discount."

This is honest, specific, and sets the right expectation without promising the moon.

---

## 1.2 Founding Coaches (First 50)

**Promise**: "Free listing forever"
**What this actually means**:

### Included Forever (The "Founding Coach" Package):

| Feature | Description | Status |
|---|---|---|
| Coach profile listing | Name, bio, photo, areas served, price range, experience | Built |
| WhatsApp contact button | Players tap to contact coach directly | Built |
| Area tagging | Coach appears in relevant area searches | Built |
| Basic analytics | View count, WhatsApp click count, heart/like count | Built |
| Coach tier badge | Automatic tier (New, Rising, Popular, Pro) based on engagement | Built |

### NOT Included in "Free Forever":

| Feature | Why It's Not Included | Tier It Belongs To |
|---|---|---|
| Featured/promoted placement in coach directory | Advertising product. | Coach Pro |
| In-app booking (players book training sessions directly) | Does not exist yet. Requires building a scheduling + payment system. | Coach Pro |
| Automated scheduling (set availability, players self-book) | Does not exist yet. | Coach Pro |
| Student management (track students, progress, notes) | Does not exist yet. CRM-like feature. | Coach Pro |
| Training package creation (sell 8-session bundles) | Does not exist yet. Requires payment integration. | Coach Pro |
| Revenue dashboard (earnings, session history) | Does not exist yet. | Coach Pro |
| Verified badge (Badelz-verified coach credentials) | Verification program. | Coach Pro |
| Multiple photos/videos on profile | Currently limited to 1 photo. | Coach Pro |
| Review/rating system (from students) | Does not exist yet. | Coach Pro |

### The Founding Coach Badge:
- "مدرب مؤسس | Founding Coach" badge on their profile
- Permanent, never removed
- Founding coaches get 50% off any future Coach Pro tier, forever

### Grandfathering Mechanism:
- `foundingCoach: true` flag in the database
- When Coach Pro launches, founding coaches see: "Your listing stays free forever. Upgrade to Coach Pro to unlock bookings, scheduling, and student management at 50% off."

---

## 1.3 The Universal Rule

**What "free forever" means across the board:**

> Any feature that exists AND is available to a user at the time they are designated as a "founding" member stays free for them forever. Future features that are built AFTER their designation are NOT automatically free -- they are available at a permanent 50% founding discount.

This is the contract. Write it down. Reference it every time you're tempted to promise more.

---

# 2. VENUE PRICING TIERS

## Tier Structure: Free / Business / Enterprise

### 2.1 Free Tier (Badelz Listing) -- 0 EGP/month

**Who it's for**: Every venue. No limit. This is your supply acquisition engine.

**Value proposition**: "انضم لبادلز مجانا. اللاعبين يلاقوك ويحجزوا -- وانت بيجيلك notification."
(Join Badelz for free. Players find you and book -- and you get notified.)

| Feature | Included |
|---|---|
| Venue listing (name, photos, location, hours, prices) | Yes |
| Up to 8 courts | Yes |
| Court pricing management | Yes |
| Booking notifications (WhatsApp) | Yes |
| View & manage bookings | Yes |
| Manual booking creation (walk-ins) | Yes |
| Basic calendar view | Yes |
| Venue settings & cover photo | Yes |
| QR code poster | Yes |
| "Badelz Listing" badge on venue page | Yes |

**Limitations (soft, not punitive):**
- No analytics beyond booking count
- No deposit collection
- No WhatsApp marketing tools
- Single owner login only
- Standard search placement (not featured)
- Badelz branding on venue page ("Powered by Badelz")

**Why this works**: The free tier is genuinely useful. A venue owner can manage their entire booking operation from here. The limitations are not annoying -- they're simply the absence of premium features that the owner doesn't know they need yet.

### 2.2 Business Tier (Badelz Business / بادلز بيزنس) -- 999 EGP/month

**Who it's for**: Active venues with 4+ courts that want to optimize revenue and reduce no-shows.

**Value proposition**: "اعرف فلوسك. قلل الـ no-shows. خلي ملعبك دايما مليان."
(Know your money. Reduce no-shows. Keep your courts always full.)

**The value metric**: Revenue insight + no-show prevention. The pitch is: "If Badelz Business prevents even 2 no-shows per month, it pays for itself."

| Feature | Free | Business |
|---|---|---|
| Everything in Free | Yes | Yes |
| **Analytics dashboard** (revenue tracking, bookings by day/hour/court, trends, player demographics) | -- | Yes |
| **Deposit collection** (collect 50-100 EGP deposits from players to prevent no-shows) | -- | Yes |
| **Dynamic pricing suggestions** (AI recommends optimal pricing for off-peak/peak based on demand data) | -- | Yes |
| **Featured placement** (appear first in area search results, "Featured" badge) | -- | Yes |
| **WhatsApp marketing** (send promotions to past bookers, new court alerts, automated reminders) | -- | Yes |
| **Multi-staff access** (add receptionist/manager accounts with role permissions) | -- | Yes |
| **Tournament hosting tools** (create and manage in-app tournaments) | -- | Yes |
| **Coach marketplace** (venue appears as available training location for coaches) | -- | Yes |
| **Booking source tracking** (see which bookings came from Badelz vs walk-in vs referral) | -- | Yes |
| **Custom booking rules** (minimum advance booking time, cancellation policy, peak hour surcharge) | -- | Yes |
| Remove "Powered by Badelz" branding | -- | Yes |
| Priority support (WhatsApp direct line to Badelz team) | -- | Yes |
| Unlimited courts | -- | Yes |

**Upgrade trigger (what makes a venue WANT to upgrade)**:
1. They see "You had 5 no-shows this month. Badelz Business deposit collection could have saved you 2,500 EGP." (Show the pain, quantify the loss.)
2. They ask "How many bookings did I get this week?" and the answer is "Upgrade to see your analytics."
3. A competing venue in their area gets "Featured" badge and appears above them in search.
4. They want to send a promotion to past bookers but can't without Business tier.

**Price justification (for the venue owner who asks "why 999?")**:
- One no-show costs 400-600 EGP. Preventing 2 per month = 800-1,200 EGP saved. Business tier pays for itself.
- Skedda (generic, English-only, no padel features) costs $20-50/month = 1,000-2,500 EGP. Badelz Business is cheaper AND padel-specific AND Arabic.
- 999 EGP = less than the revenue from 2 court bookings. If Business tier drives even 2 extra bookings/month, it's profit.

### 2.3 Enterprise Tier (Badelz Enterprise / بادلز إنتربرايز) -- 2,499 EGP/month

**Who it's for**: Multi-location chains (Pro Padel Egypt, SR Padel scale) and large venues (10+ courts).

**Value proposition**: "ادير كل فروعك من مكان واحد."
(Manage all your branches from one place.)

| Feature | Business | Enterprise |
|---|---|---|
| Everything in Business | Yes | Yes |
| **Multi-location dashboard** (unified view across all branches) | -- | Yes |
| **Competitor benchmarking** (pricing intelligence vs nearby venues) | -- | Yes |
| **API access** (integrate Badelz with POS, accounting, or custom systems) | -- | Yes |
| **Branded booking page** (custom domain subdomain, venue branding) | -- | Yes |
| **Dedicated account manager** | -- | Yes |
| **Custom reports** (monthly PDF performance reports) | -- | Yes |
| **Staff performance tracking** (which receptionist handles most bookings) | -- | Yes |
| **Revenue forecasting** (predict next month's revenue based on trends) | -- | Yes |
| White-label option (remove all Badelz branding, venue's own booking system) | -- | Yes |

**TAM for Enterprise**: 10-15 venues in Egypt (multi-location chains). This is a small but high-value segment. Don't build it until you have 3+ chains asking for it.

### 2.4 Venue Tier Summary Card

```
                    Free              Business           Enterprise
                    0 EGP/mo          999 EGP/mo         2,499 EGP/mo
                    ─────────         ─────────          ─────────
Listing             [x]               [x]                [x]
Courts              Up to 8           Unlimited          Unlimited
Booking mgmt        [x]               [x]                [x]
WhatsApp notifs     [x]               [x]                [x]
Analytics           --                [x]                [x]
Deposit collection  --                [x]                [x]
Dynamic pricing     --                [x]                [x]
Featured placement  --                [x]                [x]
WA marketing        --                [x]                [x]
Multi-staff         --                [x]                [x]
Tournaments         --                [x]                [x]
Multi-location      --                --                 [x]
API access          --                --                 [x]
White-label         --                --                 [x]
```

**Founding venue pricing**: Free tier features free forever. Business at 499 EGP/mo. Enterprise at 1,249 EGP/mo.

---

# 3. PLAYER PRICING TIERS

## Tier Structure: Free / Pro

Players get TWO tiers only. Keep it simple. Egyptian consumers hate complex pricing.

### 3.1 Free Tier (Every Player) -- 0 EGP, Forever

**This is the sacred cow. Never charge for the core loop.**

| Feature | Included |
|---|---|
| Browse venues by area | Yes |
| View venue details, prices, availability | Yes |
| Book a court (name + phone, no account needed) | Yes |
| Game Link (create & share shareable booking rooms) | Yes |
| Join open games in the Lobby | Yes |
| Player card (6-tier ranking system, Bronze to Grandmaster) | Yes |
| Leaderboard | Yes |
| Marketplace (browse and list gear for sale) | Yes |
| Coach directory (browse, contact via WhatsApp) | Yes |
| My Bookings (view booking history) | Yes |
| WhatsApp booking confirmation | Yes |

**Key rule**: Everything a player can do TODAY stays free forever. The core booking flow -- discover, book, play -- must NEVER have a paywall in front of it.

### 3.2 Pro Tier (Badelz Pro / بادلز برو) -- 49 EGP/month

**Who it's for**: Serious padel players who play 2+ times per week. Status-conscious. Want every edge.

**Value proposition**: "العب اكتر. العب احسن. العب اول."
(Play more. Play better. Play first.)

| Feature | Free | Pro |
|---|---|---|
| Everything in Free | Yes | Yes |
| **Priority booking** (book peak slots 48 hours before everyone else) | -- | Yes |
| **Unlimited "I'm Available" posts** in Lobby (free gets 2/week) | 2/week | Unlimited |
| **Advanced stats** (win rate, skill progression graph, favorite venues, monthly trends, head-to-head records) | Basic count only | Full dashboard |
| **"Fill My Spot" instant replacement** (find a sub when you can't make it) | 1/month | Unlimited |
| **Pro badge** on player card and in Lobby (gold accent, visible status symbol) | -- | Yes |
| **Pro Leaderboard** (separate ranking for Pro members, more competitive) | -- | Yes |
| **Ad-free experience** (no venue promotions or featured listings in browse) | Shows featured | Clean feed |
| **Smart matchmaking** (algorithm suggests players at your skill level nearby) | -- | Yes |
| **Booking analytics** (spending tracker, play frequency, "you played X hours this month") | -- | Yes |
| **Profile customization** (custom card design, cover photo, tagline) | Standard card | Custom card |
| **Tournament priority** (guaranteed spot in Badelz-organized tournaments before they fill) | Standard queue | Priority entry |
| **No-show shield** (if your group member no-shows, your deposit is automatically refunded) | -- | Yes |

**Why 49 EGP/month**:
- Less than the cost of one padel game (75-175 EGP per player per session)
- If you play 8x/month, that's 6 EGP per game for all premium features
- Equivalent to ~$1 USD. Psychologically negligible for the target demo.
- Monthly billing only (no annual initially -- test willingness to pay first)
- Annual plan added later: 399 EGP/year (save 189 EGP = 32% off = 2 months free)

**Upgrade triggers**:
1. Player tries to post in Lobby and hits the 2/week limit. "Upgrade to Pro for unlimited posts."
2. Player taps on their stats and sees locked advanced metrics. "See your win rate and skill progression with Pro."
3. Player sees a "Pro" badge on another player's card in the Lobby and wants one.
4. Player tries to book a peak Thursday 8pm slot and it's full. "Pro members got 48-hour early access."
5. Player's friend no-shows and they're stuck with the cost. "Pro members get automatic refunds when group members no-show."

**Conversion target**: 3% of MAU by Month 12. At 4,500 MAU = 135 Pro subscribers = 6,615 EGP/month.

### 3.3 Player Tier Summary Card

```
                    Free              Pro
                    0 EGP             49 EGP/mo
                    ─────────         ─────────
Book courts         [x]               [x]
Game Link           [x]               [x]
Lobby (join)        [x]               [x]
Lobby (post)        2/week            Unlimited
Player card         Standard          Custom + Pro badge
Leaderboard         [x]               [x] + Pro board
Marketplace         [x]               [x]
Coach directory     [x]               [x]
Stats               Basic             Advanced dashboard
Priority booking    --                48h early access
Fill My Spot        1/month           Unlimited
Smart matchmaking   --                [x]
No-show shield      --                [x]
Ad-free             --                [x]
```

---

# 4. COACH PRICING TIERS

## Tier Structure: Free / Coach Pro

### 4.1 Free Tier (Coach Listing) -- 0 EGP, Forever

| Feature | Included |
|---|---|
| Profile listing (name, bio, photo, areas, price range, experience) | Yes |
| WhatsApp contact button | Yes |
| Area-based search visibility | Yes |
| Basic analytics (views, WA clicks, hearts) | Yes |
| Automatic tier badge (New/Rising/Popular/Pro) | Yes |

### 4.2 Coach Pro Tier (بادلز كوتش برو) -- 149 EGP/month

**Who it's for**: Coaches who want to build a real coaching business through Badelz. Coaches earning 5,000+ EGP/month from padel training.

**Value proposition**: "اوصل لطلاب اكتر. نظم مواعيدك. كبر البيزنس بتاعك."
(Reach more students. Organize your schedule. Grow your business.)

| Feature | Free | Coach Pro |
|---|---|---|
| Everything in Free | Yes | Yes |
| **Featured placement** (appear first in coach directory, "Featured" badge) | -- | Yes |
| **In-app booking** (players book training sessions directly, not just WhatsApp) | -- | Yes |
| **Availability calendar** (set your weekly schedule, players see open slots) | -- | Yes |
| **Student management** (track students, session history, notes) | -- | Yes |
| **Training packages** (create and sell 4/8/12 session bundles) | -- | Yes |
| **Verified badge** (Badelz-verified credentials, shows certification) | -- | Yes |
| **Multiple photos/videos** (up to 10 media items, including training clips) | 1 photo | 10 media |
| **Review system** (students leave ratings and reviews) | -- | Yes |
| **Revenue dashboard** (track earnings, sessions completed, student retention) | -- | Yes |
| **Promotional tools** (send offers to past students, "first session 50% off") | -- | Yes |

**Why 149 EGP/month**:
- A coach charging 300 EGP/session needs ONE extra session per month to more than cover the cost
- Training packages in Egypt run 2,400 EGP/player for 8 sessions. 149 EGP is 6% of one package.
- It's between the player Pro (49 EGP) and venue Business (999 EGP) -- reflects the coach's earning power
- Monthly, cancel anytime

**Founding coach pricing**: 75 EGP/month (50% off, forever)

**Upgrade triggers**:
1. Coach profile gets 50+ views/month but only 5 WhatsApp clicks. "Your conversion rate is low. Coach Pro's booking feature removes friction -- players book without leaving the app."
2. Coach wants to sell training packages but has no way to manage them.
3. Coach sees a competing coach with a "Verified" badge and more reviews.

**TAM**: 200-300 active padel coaches in Greater Cairo. Target 10-15% conversion = 20-45 Coach Pro subscribers by M12.

---

# 5. TRANSACTION-BASED REVENUE

This is where the real money lives. Tier subscriptions are predictable MRR; transaction revenue scales with volume.

## 5.1 Convenience Fee (Player-Facing)

**What**: A flat fee charged to players who choose to pay online (via Paymob/Fawry/VCash) instead of paying cash at the venue.

| Detail | Value |
|---|---|
| Fee amount | 15 EGP per booking (flat, not percentage) |
| Who pays | The player (split across all players if split payment = ~4 EGP each) |
| When | Only when paying online. "Pay at venue" is always free. |
| Launch | Month 4-5 (when Paymob integration is ready) |

**Why flat fee, not percentage**:
- A flat 15 EGP is predictable and transparent. Egyptians hate percentage-based fees that change per booking.
- On a 350 EGP booking, 15 EGP = 4.3%. On a 600 EGP booking, 15 EGP = 2.5%. The effective rate decreases as booking value increases, which feels fair.
- "15 جنيه رسوم الدفع الأونلاين" is easy to communicate. "2.5-4.3% processing fee" is confusing.

**Positioning**: "ادفع اونلاين. ضمن مكانك. من غير كاش."
(Pay online. Guarantee your spot. No cash needed.)

The fee is for CONVENIENCE, not for booking. Booking is always free. Payment is where the fee lives.

## 5.2 Deposit Processing Fee (Venue-Facing)

**What**: When venues enable deposit collection (Business tier), Badelz processes the deposits and takes a processing fee.

| Detail | Value |
|---|---|
| Processing fee | 5% of deposit amount |
| Who pays | Deducted from the deposit (venue receives 95% of forfeited deposits) |
| Deposit range | 50-100 EGP per player (venue sets the amount) |
| When | Month 4-5 (with payment integration) |

**Math example**:
- Venue requires 75 EGP deposit per player, 4 players = 300 EGP total deposit
- Badelz takes 5% = 15 EGP
- If all players show: deposits are applied to the court fee, venue collects full price at court minus deposit already paid
- If 1 player no-shows: venue keeps 71.25 EGP (95% of 75 EGP forfeited deposit)
- Badelz keeps 3.75 EGP from the no-show's deposit processing

## 5.3 Payment Processing Spread

**What**: When players pay the full court fee through Badelz (split payment or full prepayment), Badelz earns the spread between what the player pays and what Paymob charges.

| Detail | Value |
|---|---|
| Player-facing rate | Included in the 15 EGP convenience fee |
| Paymob processing cost | ~2-2.75% (varies by payment method) |
| Badelz net margin | 15 EGP minus ~10-12 EGP Paymob fee = ~3-5 EGP net per booking |
| When | Month 4-5 (with payment integration) |

**Note**: The convenience fee already covers the payment processing cost and includes margin. Do NOT charge both a convenience fee AND a separate processing fee to the player. That's the "hidden fee" behavior Egyptians hate.

## 5.4 Coach Booking Commission

**What**: When Coach Pro coaches receive bookings through Badelz's in-app booking system, Badelz takes a commission.

| Detail | Value |
|---|---|
| Commission rate | 10% of session fee |
| Who pays | Deducted from coach's earnings |
| When | Month 8-10 (when in-app coaching bookings launch) |

**Math**: Coach charges 300 EGP/session. Badelz takes 30 EGP. Coach receives 270 EGP.
At 100 sessions/month across all coaches: 3,000 EGP/month.

## 5.5 Tournament Entry Fee Revenue Share

**What**: When Badelz organizes or facilitates tournaments, it takes a cut of entry fees.

| Detail | Value |
|---|---|
| Revenue share | 20-25% of entry fees |
| Entry fee range | 100-250 EGP per player |
| When | Month 6-8 |

## 5.6 Transaction Revenue Summary

```
Revenue Stream          Price               Who Pays        Launch
──────────────          ─────               ────────        ──────
Convenience fee         15 EGP/booking      Player          Month 4-5
Deposit processing      5% of deposit       Venue (from     Month 4-5
                                            forfeited $)
Coach commission        10% of session fee  Coach           Month 8-10
Tournament rev share    20-25% of entries   Organizer/      Month 6-8
                                            Player
```

---

# 6. PRICING PSYCHOLOGY & EGYPT MARKET RULES

## 6.1 The Ten Commandments of Egyptian Pricing

1. **Show the total price upfront. Always.** Never add fees at checkout. If there's a convenience fee, show it BEFORE the player confirms. "الحجز: 450 جنيه + 15 جنيه رسوم الدفع الأونلاين = 465 جنيه" -- clear, transparent, done.

2. **Monthly billing, not annual.** Egypt is a cash-heavy, paycheck-to-paycheck economy even for upper-middle class. Monthly feels lower-risk. Introduce annual later (Month 10+) as a discount option.

3. **Use round numbers.** 999 not 997. 49 not 47. 149 not 147. Egyptian consumers don't respond to the ".99 trick" the same way. Round-ish numbers (ending in 9 or 0) signal honesty.

4. **Never take away free features.** If a feature was free when a user started, it stays free for that user forever. You can limit NEW users' access to it, but never retroactively paywall existing users. This destroys trust instantly in Egypt.

5. **Frame fees as convenience, not taxes.** "رسوم الدفع الأونلاين" (online payment fee) is accepted. "عمولة" (commission) is hated. Same money, different framing.

6. **Anchor to the cost of padel, not to SaaS.** Venues think in bookings, not MRR. "999 EGP = 2 bookings worth" is more persuasive than "999 EGP/month for enterprise software."

7. **Offer "pay at venue" always.** Even when online payments launch, the cash option must remain. Egyptians want to CHOOSE digital, not be forced into it.

8. **WhatsApp is your billing channel.** Send payment reminders via WhatsApp, not email. Accept payment proof screenshots via WhatsApp. Meet them where they are.

9. **Free trial beats money-back guarantee in Egypt.** "جرب مجانا 14 يوم" (Try free for 14 days) is more powerful than "ضمان استرداد الفلوس" (money-back guarantee) because the refund process is distrusted.

10. **Social proof closes the deal.** "42 ملعب بيستخدموا Badelz Business" (42 venues use Badelz Business) is more persuasive than any feature list.

## 6.2 Pricing Anchoring Strategy

When presenting Business tier to venues, always show three options:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Free           Business ★           Enterprise
   0 EGP          999 EGP/mo           2,499 EGP/mo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The Enterprise tier exists partly to make Business look reasonable. This is classic price anchoring. Most venues will never need Enterprise, but its existence makes 999 EGP feel like a deal.

The star (★) on Business signals "most popular" -- even before it is. Pre-social-proof.

## 6.3 The "Number of Bookings" Framing

Never pitch venue pricing in abstract EGP. Always convert to bookings:

| Tier | Price | In Bookings (at 450 EGP avg) |
|---|---|---|
| Free | 0 | 0 bookings |
| Business | 999 EGP/mo | ~2.2 bookings worth |
| Enterprise | 2,499 EGP/mo | ~5.5 bookings worth |

**Pitch**: "لو بادلز جابلك حجزين زيادة في الشهر بس، الـ Business plan بتدفع نفسها."
(If Badelz brings you just 2 extra bookings per month, the Business plan pays for itself.)

## 6.4 The Free-to-Paid Nudge System

Do NOT hard-paywall features. Instead, use a progressive "taste and upgrade" approach:

**For Venues (Free -> Business)**:
1. Month 1-2: Full free experience. No upsell. Build trust.
2. Month 3: Start showing "teaser analytics" -- "You got 23 bookings this month. Upgrade to Business to see your peak hours, player demographics, and revenue trends." Show the SHAPE of the data (blurred charts) but not the details.
3. Month 4: When payment integration is live, venues that lose money to no-shows see: "Last month, 4 players didn't show up. That's ~2,400 EGP lost. Business tier's deposit collection could have prevented this."
4. Month 5+: Featured placement launches. Non-Business venues see competitors marked "Featured" above them. Subtle FOMO.

**For Players (Free -> Pro)**:
1. Month 1-6: Pure free experience. Build habits.
2. Month 7: Introduce lobby posting limits (2/week for free). Show "Upgrade to Pro for unlimited."
3. Month 8: Launch advanced stats. Show a locked dashboard with blurred numbers.
4. Month 9: Priority booking for peak slots. Free players see "Sold out" while Pro members still have access.
5. Ongoing: Pro badges are visible everywhere. Status envy is the most powerful upgrade trigger.

---

# 7. LAUNCH TIMELINE & REVENUE TRIGGERS

## 7.1 Phased Rollout

### Phase 0: Foundation (Month 1-3, March-May 2026) -- CURRENT PHASE

**Revenue**: 0 EGP
**Focus**: Supply acquisition + demand generation

| What Launches | When | Revenue Impact |
|---|---|---|
| Free venue listings | Now (live) | 0 (but builds supply) |
| Free player booking | Now (live) | 0 (but builds demand) |
| Free coach listings | Now (live) | 0 (but builds ecosystem) |
| Founding venue program (20 max) | Now - Month 2 | 0 (but creates advocates) |
| Founding coach program (50 max) | Now - Month 2 | 0 (but fills coach directory) |

**Success metrics for Phase 0**:
- 20+ venues onboarded
- 500+ registered players
- 100+ bookings/week
- 50+ coaches listed

**DO NOT start Phase 1 until at least 15 venues are active and bookings exceed 50/week.**

### Phase 1: First Revenue (Month 4-6, June-August 2026)

**Revenue target**: 5,000-10,000 EGP/month by end of Phase 1

| What Launches | When | Price | Expected Revenue |
|---|---|---|---|
| Featured venue placement (a la carte) | Month 4 | 500 EGP/month per venue | 3-5 x 500 = 1,500-2,500 |
| Online payments (Paymob/Fawry) | Month 4-5 | -- | Enables convenience fee |
| Convenience fee on online bookings | Month 5 | 15 EGP/booking | 100 x 15 = 1,500 |
| Deposit collection (for interested venues, pre-Business tier) | Month 5 | 5% processing fee | 50 x 15 = 750 |
| Spotlight campaigns (venue promotions) | Month 4 | 1,000 EGP one-time | 1-2 = 1,000-2,000 |

**Key decision**: Featured placement and spotlight campaigns can launch WITHOUT a payment gateway. Venues can pay via Vodafone Cash or InstaPay transfer. This is your earliest possible revenue.

### Phase 2: Premium Tiers (Month 7-9, September-November 2026)

**Revenue target**: 20,000-30,000 EGP/month by end of Phase 2

| What Launches | When | Price | Expected Revenue |
|---|---|---|---|
| Badelz Pro (player subscription) | Month 7 | 49 EGP/month | 50-100 subs x 49 = 2,450-4,900 |
| Badelz Business (venue subscription) | Month 7-8 | 999 EGP/month | 3-5 venues x 999 = 2,997-4,995 |
| Featured placement folded into Business | Month 8 | Included in 999 | Migration from a la carte |
| Lobby posting limits (free = 2/week) | Month 7 | -- | Drives Pro conversion |
| Advanced player stats | Month 7 | Pro-only | Drives Pro conversion |
| Tournaments (Badelz-organized) | Month 8 | 150-200 EGP/player, 25% cut | 1-2 tournaments = 2,400-4,800 |

**Critical pre-requisite**: Do NOT launch premium tiers until you have at least 2,000 registered players and 30 active venues. Launching too early = low conversion = demoralized.

### Phase 3: Payments at Scale (Month 10-12, December 2026 - February 2027)

**Revenue target**: 50,000-70,000 EGP/month by end of Phase 3

| What Launches | When | Price | Expected Revenue |
|---|---|---|---|
| Split payment (4 players pay their share online) | Month 10 | Included in convenience fee | Increases online payment adoption |
| Coach Pro | Month 10 | 149 EGP/month | 10-15 coaches x 149 = 1,490-2,235 |
| In-app coaching bookings + 10% commission | Month 10 | 10% of session fee | 30-50 sessions x 30 = 900-1,500 |
| Badelz Enterprise | Month 11 | 2,499 EGP/month | 1-2 chains = 2,499-4,998 |
| Annual Pro plan | Month 11 | 399 EGP/year | Increases retention |
| Corporate booking feature | Month 12 | 15-20% markup | 2-3 events = 6,000-9,000 |

### Phase 4: Maturity & Expansion (Month 13-24)

| What Launches | When | Price | Expected Revenue |
|---|---|---|---|
| Advertising (equipment brands, sports drinks) | Month 13+ | 5,000-10,000 EGP/campaign | 2-4 campaigns/month |
| Loyalty program (play 10 = 1 free) | Month 15 | Funded by venues | Retention play |
| Geographic expansion (Alexandria, Giza) | Month 14+ | Same pricing | Volume multiplier |
| MENA expansion (Saudi, UAE) | Month 18+ | USD pricing for Gulf | New market |
| Annual Business plan | Month 14 | 9,999 EGP/year (save 17%) | Reduces churn |

## 7.2 Revenue Trigger Matrix

**These triggers tell you WHEN to launch the next phase. Do not launch on a calendar -- launch on signals.**

| Trigger | Signal | Action |
|---|---|---|
| 15+ active venues | Supply is sufficient | Start Phase 1 (featured placements) |
| 50+ bookings/week | Demand is real | Integrate Paymob, launch convenience fee |
| 2,000+ registered players | Player base critical mass | Launch Badelz Pro |
| 30+ active venues | Venue base critical mass | Launch Badelz Business |
| 3+ venues asking for analytics | Pull demand for premium | Accelerate Business tier launch |
| 5+ no-show complaints from venues | Pain point validated | Prioritize deposit collection |
| 20+ coaches listed | Coach ecosystem viable | Launch Coach Pro |
| 500+ online bookings/month | Payment habit formed | Launch split payments |
| 2+ multi-location chains onboarded | Enterprise demand exists | Build and launch Enterprise |

---

# 8. REVENUE PROJECTIONS BY TIER

## 8.1 Base Case Monthly Revenue by Stream

| Stream | M3 | M6 | M9 | M12 | M18 | M24 |
|---|---|---|---|---|---|---|
| Venue Featured (a la carte) | 0 | 2,000 | 0* | 0* | 0* | 0* |
| Convenience Fee (15 EGP) | 0 | 1,500 | 6,000 | 12,000 | 30,000 | 60,000 |
| Deposit Processing (5%) | 0 | 750 | 3,000 | 6,000 | 9,000 | 12,000 |
| Badelz Business (999/mo) | 0 | 0 | 4,995 | 9,990 | 24,975 | 39,960 |
| Badelz Enterprise (2,499/mo) | 0 | 0 | 0 | 2,499 | 7,497 | 12,495 |
| Badelz Pro Player (49/mo) | 0 | 0 | 4,410 | 9,800 | 24,500 | 49,000 |
| Coach Pro (149/mo) | 0 | 0 | 0 | 2,235 | 5,960 | 11,175 |
| Coach Commission (10%) | 0 | 0 | 0 | 1,500 | 5,400 | 10,800 |
| Spotlight Campaigns | 0 | 1,000 | 1,500 | 2,000 | 3,000 | 5,000 |
| Tournaments | 0 | 0 | 2,400 | 4,800 | 9,600 | 14,400 |
| Corporate Events | 0 | 0 | 0 | 3,000 | 6,000 | 9,000 |
| Advertising | 0 | 0 | 0 | 0 | 5,000 | 15,000 |
| **TOTAL** | **0** | **5,250** | **22,305** | **53,824** | **130,932** | **238,830** |

*Featured placement is folded into Business tier in Month 8+

## 8.2 Revenue Mix at Month 12

| Category | EGP/month | % of Total |
|---|---|---|
| **Transaction Revenue** (convenience + deposits + processing) | 18,000 | 33% |
| **Venue SaaS** (Business + Enterprise) | 12,489 | 23% |
| **Player Subscriptions** (Pro) | 9,800 | 18% |
| **Coach Revenue** (Pro + commission) | 3,735 | 7% |
| **Events & Ads** (tournaments + corporate + ads) | 7,800 | 15% |
| **Campaigns** (spotlight) | 2,000 | 4% |
| **Total** | **53,824** | **100%** |

**Key insight**: Transaction revenue is the largest single category by Month 12, validating the "inversion strategy" (free supply, monetize demand layer). But SaaS subscriptions provide the predictable base. The mix is healthy -- no single stream exceeds 35%.

## 8.3 Subscriber Count Targets

| Metric | M6 | M9 | M12 | M18 | M24 |
|---|---|---|---|---|---|
| Venues (total, free + paid) | 35 | 55 | 75 | 120 | 180 |
| Badelz Business subscribers | 0 | 5 | 10 | 25 | 40 |
| Badelz Enterprise subscribers | 0 | 0 | 1 | 3 | 5 |
| Registered players | 1,500 | 4,000 | 7,500 | 15,000 | 30,000 |
| MAU | 800 | 2,200 | 4,000 | 8,000 | 16,000 |
| Badelz Pro subscribers | 0 | 90 | 200 | 500 | 1,000 |
| Coaches (total, free + paid) | 30 | 50 | 80 | 120 | 180 |
| Coach Pro subscribers | 0 | 0 | 15 | 40 | 75 |

## 8.4 Annual Revenue Summary

| Year | Revenue (EGP) | Revenue (USD, ~50 EGP/$) |
|---|---|---|
| Year 1 (M1-12) | ~180,000 | ~$3,600 |
| Year 2 (M13-24) | ~1,800,000 | ~$36,000 |
| **Cumulative** | **~1,980,000** | **~$39,600** |

---

# 9. FAQ & EDGE CASES

## Q: What if a founding venue wants to upgrade to Business -- do they pay full price?

**A**: No. Founding venues get 50% off any paid tier, forever. Business = 499 EGP/month. Enterprise = 1,249 EGP/month. The "free forever" promise is honored by keeping their current features free AND discounting future features.

## Q: What if we want to add a feature to the free tier that's currently premium?

**A**: You can always EXPAND the free tier (move features down). You can NEVER SHRINK it (move features up). If analytics is Business-only and you later decide to make basic analytics free, that's fine. The reverse (making something free into paid) is forbidden.

## Q: What if a founding venue stops using Badelz for 6 months and comes back?

**A**: Their founding status is permanent. The badge and discount are tied to their account, not their activity level. If they come back in 2 years, they still get 50% off.

## Q: Can a venue buy featured placement without subscribing to Business?

**A**: Yes, but only in Phase 1 (Month 4-7) before Business tier launches. Once Business launches, featured placement is bundled into the 999 EGP/month plan. A la carte featured placement is no longer sold separately. This creates urgency: "Featured is going away as a standalone product -- it'll only be available inside Business tier."

## Q: What if a player wants to pay for Pro but we don't have Paymob yet?

**A**: Accept Vodafone Cash or InstaPay payments manually for the first 20-30 Pro subscribers. It's janky but it validates willingness to pay before building payment infrastructure. Track in a spreadsheet.

## Q: What happens to the "founding" programs after slots are filled?

**A**: First 20 founding venues = closed once 20 are onboarded. First 50 founding coaches = closed once 50 are listed. After that, new venues join the Free tier (no founding discount). But show the founding badges prominently so future venues see what they missed -- this creates regret and urgency for the next promotion (e.g., "Early Adopter" badge at 50% discount for venues 21-50).

## Q: Should we ever do discounts or promotions on paid tiers?

**A**: Yes, but strategically:
- **Launch discount** when a tier first goes live: "اول شهر مجاني" (First month free) or "اول 10 ملاعب: 699 EGP بدل 999" (First 10 venues: 699 instead of 999). Creates urgency.
- **Annual discount** (introduced Month 10+): Pay 10 months, get 12. Never more than 2 months free.
- **Seasonal promotions**: Ramadan (padel demand drops), summer (players travel). Offer 1-month trial or price hold.
- **Never discount below 50% of list price.** It devalues the product permanently.

## Q: What if Padel Finder drops their prices or goes free to compete?

**A**: This is the competitive retaliation scenario. If Padel Finder goes free for venues:
1. Your founding venue program already has you covered -- they're locked in with Badelz.
2. Accelerate features Padel Finder can't quickly copy: Lobby system, Game Link, player cards, marketplace, coaching marketplace.
3. Do NOT engage in a price war. Your product differentiates on Arabic-first UX, community features, and the player-side experience -- not on being cheaper than free.

## Q: What about venue-specific pricing for different areas?

**A**: Not in Year 1. One price nationally (999 EGP for Business). In Year 2, if you expand to different markets (Alexandria, Gulf), consider regional pricing. But for Greater Cairo, one price is simpler and fairer.

## Q: What if a coach is also a venue owner?

**A**: They get both roles. Founding status is per-role. If they signed up as founding coach AND founding venue, they get both discounts. The accounts are separate (coach profile vs venue dashboard).

---

# APPENDIX: THE ONE-PAGE CHEAT SHEET

Print this. Tape it to your wall.

```
═══════════════════════════════════════════════════════════════
                    BADELZ PRICING CHEAT SHEET
═══════════════════════════════════════════════════════════════

VENUES:
  Free ........... 0 EGP     Listing + bookings + notifications
  Business ....... 999 EGP   + Analytics + deposits + featured
  Enterprise ..... 2,499 EGP + Multi-location + API + white-label
  Founding (20) .. 50% off paid tiers forever

PLAYERS:
  Free ........... 0 EGP     Book + Lobby + Card + Marketplace
  Pro ............ 49 EGP    + Priority + Stats + Badge + Unlimited

COACHES:
  Free ........... 0 EGP     Listing + WhatsApp + basic analytics
  Coach Pro ...... 149 EGP   + Featured + Booking + Packages + Verified
  Founding (50) .. 50% off Coach Pro forever

TRANSACTIONS:
  Convenience fee  15 EGP/booking (online payments only)
  Deposit fee .... 5% of deposit (from forfeited amount)
  Coach commish .. 10% of session fee (in-app bookings)
  Tournament ..... 20-25% of entry fees

RULES:
  1. Core booking is ALWAYS free for players
  2. "Pay at venue" is ALWAYS an option
  3. Never take away a free feature
  4. Show total price BEFORE confirmation
  5. Founding = permanent flag, never expires

TIMELINE:
  M1-3: Free everything. Build supply + demand.
  M4-6: First revenue (featured + convenience fee + deposits)
  M7-9: Premium tiers (Pro + Business)
  M10-12: Scale (Coach Pro + Enterprise + split payments)
  M13+: Expand (ads, corporate, MENA)

═══════════════════════════════════════════════════════════════
```

---

*This document is the single source of truth for Badelz pricing decisions. Any deviation should be discussed and this document updated accordingly. Last updated: March 27, 2026.*
