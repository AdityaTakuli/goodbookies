# Good Bookies — Product Requirements Document (PRD)

**Version:** 2.0 (as-built)  
**Last updated:** May 2026  
**Product:** Sports turf / venue booking marketplace

---

## 1) Product Summary

Good Bookies is a web application where **players** discover sports venues and book hourly slots, **partners (owners)** manage turfs/pricing/bookings, and **admins** govern the platform.

**Core value**
- **Players:** Find a turf, pick a date/time, choose how many players, enter player names, pay, and get instant confirmation.
- **Owners:** List venues, control slots/pricing, view analytics and payouts.
- **Admin:** Platform-wide bookings, users, venues, sports, payments, analytics, and settings.

**Brand positioning:** “Book the pitch. Play the match.” — floodlit turfs, cricket nets, indoor courts, real-time slot availability.

---

## 2) User Roles & Access

| Role | How assigned | Login route | Gated areas |
|------|--------------|-------------|-------------|
| **Player** | Default on signup | `/login`, `/signup` | `/account/*` |
| **Owner (Partner)** | `owners` row + `user_roles.role = owner` | `/owner/login`, `/owner/register` | `/owner/*` (requires `owners.status = approved`) |
| **Admin** | `user_roles.role = admin` | `/login` | `/admin/*` |

**Current access policy (important)**
- **Owner registration:** Auto-approved (`status = approved`, owner role assigned immediately).
- **Owner login:** Works for all valid credentials; dashboard still requires `approved` status in layout.
- **Venue creation by owner:** Auto-approved and active (`approval_status = approved`, `is_active = true`).
- **Bookings:** Always saved as **`confirmed`** (manual confirmation mode is ignored in code).
- **Discovery:** Only venues with `is_active = true` AND `approval_status = approved` appear to players.

---

## 3) System Architecture

### 3.1 Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Framer Motion |
| Routing / SSR | TanStack Router, TanStack Start, TanStack Query |
| Validation | Zod |
| Charts | Recharts |
| Backend logic | TanStack `createServerFn` (server functions) |
| Database & Auth | Supabase (PostgreSQL + Auth + RLS) |
| Payments | Razorpay (order create + refund) |
| Email | Custom email service (owner approval emails) |
| Deployment | Vercel (Node.js serverless + static assets) |

### 3.2 Deployment architecture (Vercel)

```
Browser
   │
   ▼
Vercel Edge / CDN
   ├── /assets/*, /favicon.*  →  static files from /client (filesystem)
   └── all other routes       →  /api/render (Node.js serverless)
                                    │
                                    ▼
                              dist/server/index.js (TanStack SSR bundle)
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Server Functions   Supabase Admin   Razorpay API
              (booking, owner,   (PostgreSQL)     (payments)
               admin, account)
```

**`vercel.json` routing**
1. Serve static filesystem first.
2. Map `/assets/*` → `/client/assets/*`.
3. Catch-all `/(.*)` → `/api/render?path=$1` for SSR.

**`api/render.ts`**
- Node.js runtime (not Edge).
- Loads built SSR bundle from `dist/server/index.js`.
- Converts Vercel `IncomingMessage` → Web `Request` for TanStack server entry.

### 3.3 Request / data flow (booking)

```
Player UI (/venues/:slug)
   → getVenue, getSlots (playerCount)
   → createBooking (playerCount, playerNames)
        → loadVenuePricing + calculateBookingTotal
        → Razorpay order + payments row
        → bookings row (confirmed, player_count, player_names)
        → notifications (player + owner)
   → redirect /booking/success?id=...
```

### 3.4 Environment dependencies

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (client)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (optional; without keys payment status defaults to success in dev)

---

## 4) Database Schema (Key Tables)

### Core marketplace

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `auth.users` | Supabase auth | id, email, metadata |
| `profiles` | Player profile | full_name, email, phone, `is_banned` |
| `user_roles` | RBAC | user_id, role (`admin`, `user`, `owner`) |
| `sports` | Sport catalog | name, slug, icon, is_active |
| `venues` | Turf listings | name, slug, sport_id, owner_id, city, address, price_per_hour, opening/closing_hour, amenities, rating, image_url, **`max_players_allowed`**, operating_days, holiday_dates, confirmation_mode, approval_status, is_active |
| `bookings` | Slot reservations | user_id, venue_id, booking_date, start_hour, end_hour, total_price, status, **`player_count`**, **`player_names[]`**, coupon_code, payment_id |
| `payments` | Payment ledger | booking_id, user_id, amount, razorpay_order_id, status |
| `notifications` | In-app alerts | user_id, title, message, type, is_read |

### Owner / partner

| Table | Purpose |
|-------|---------|
| `owners` | Partner profile (status: pending/approved/rejected/suspended) |
| `slot_blocks` | Owner-blocked hours (single date or recurring weekday) |
| `venue_peak_pricing` | Peak-hour surcharges |
| `venue_day_pricing` | Day-of-week price overrides |
| `venue_date_pricing` | Date-specific price overrides |
| `venue_duration_discounts` | Multi-hour discount rules |
| `coupons` | Owner discount codes |
| `owner_payout_details` | Bank account for payouts |
| `payouts` | Payout history |

### Admin / platform

| Table | Purpose |
|-------|---------|
| `site_settings` | Key-value platform config (commission rate, contact, etc.) |
| `admin_notification_log` | Audit log for broadcast notifications |

### Capacity booking migrations (required in Supabase)

- `venues.max_players_allowed` (default 10)
- `bookings.player_count` (default 1)
- `bookings.player_names` (text array)
- Drop old `bookings_no_double_book` unique index (allows partial capacity per hour)

---

## 5) Group Booking & Capacity Model (Current)

### 5.1 Concepts

- **`max_players_allowed`** (venue): Total player capacity per hour on the turf.
- **`player_count`** (booking): How many players this booking reserves.
- **`player_names`** (booking): Array of unique player names (one per player).
- **Pricing:** Hourly rate is for the **full turf hour**, not per person.
- **Payable display:** `(total_hourly_price / max_players_allowed) × selected_players`.

### 5.2 Slot availability logic

For each hour on a date:
1. Skip if holiday or non-operating day.
2. Sum `player_count` from all `confirmed` + `pending` bookings overlapping that hour.
3. `remaining_capacity = max_players_allowed - booked_players`.
4. Slot is **available** if `remaining_capacity >= requested player_count`.
5. Slot shows **`X/Y left`** on the slot picker (partial fill = amber styling).
6. Slots refresh every **5 seconds** on venue page.

### 5.3 Booking validation

- `player_count` cannot exceed venue `max_players_allowed`.
- Each selected hour must have enough remaining capacity.
- All player names required; names must be unique within the booking.
- Booking status always **`confirmed`**.

---

## 6) Page-by-Page Feature Inventory

### 6.1 Global layout (`__root.tsx`)

- Site header: Home, Sports, My Account (if logged in), Admin (if admin), Partner (if owner).
- Sign in / Get started OR Sign out.
- Mobile hamburger menu.
- Footer with sports links and partner links.
- Toast notifications (Sonner).
- Custom 404 and error pages.

---

### 6.2 Public pages

#### `/` — Home
- Hero image with gradient overlay.
- Tagline: “Real-time slot availability”.
- CTAs: “Book a slot”, “Browse venues”.
- Sports grid (auto-seeded: Football, Cricket, Badminton, Basketball if DB empty).
- Feature highlights (calendar, map, instant booking icons).

#### `/sports` — Venue discovery
- Lists all approved active venues.
- Sport filter pills (All + each sport).
- Venue cards: image, name, city, sport, price/hr, rating.
- Empty state when no venues for sport.

#### `/venues/$slug` — Venue detail & booking
**Left column**
- Venue hero image.
- Sport badge, name, address, city, rating, hours.
- **₹/hour** price display.
- Description and amenity tags.

**Right column — booking panel**
- Date picker (today onward).
- **Players dropdown** (1 … max allowed, capped by selected slot remaining capacity).
- Capacity text: booked + your players = total/max.
- **Player name inputs** (one field per selected player count).
- **Slot picker grid** (hourly buttons with `X/Y left`, available/selected/booked/partial states).
- Live “empty spots left today” counter.
- Sticky **You Pay** card:
  - Big price = payable for selected players.
  - Full turf hourly total.
  - Per-person splits.
- **Book Now** (requires login; consecutive hours only).

#### `/login` — Player login
- Email + password.
- Redirect support via `?redirect=`.
- Link to signup.

#### `/signup` — Player registration
- Email, password, name.
- Creates auth user + profile.

#### `/owner/login` — Partner login
- Separate owner auth entry.
- Informational messages by owner status (no forced sign-out).

#### `/owner/register` — Partner registration
- Name, email, phone, password, city, business name, terms checkbox.
- Creates auth user + **auto-approved** owner + owner role.
- Redirect to owner login.

#### `/booking/success` — Confirmation
- Animated success state.
- Booking ID display.
- Links: View my bookings, Book again.

#### `/dashboard` — Legacy redirect/alternate bookings entry (if used).

---

### 6.3 Player account (`/account/*`)

Layout sidebar: My Bookings, Profile, Notifications, Payment History.

#### `/account` — My bookings
- Sections: **Upcoming**, **Past**, **Cancelled**.
- Each card: venue image, sport icon, name, city, date, time range, price, status badge.
- **Cancel** on confirmed upcoming bookings.
- **Re-book** link on past bookings.

#### `/account/profile`
- Edit full name, phone.
- View/update profile fields.

#### `/account/notifications`
- List in-app notifications.
- Mark as read.

#### `/account/payments`
- Payment history from linked bookings/payments.

---

### 6.4 Owner / Partner portal (`/owner/*`)

Requires approved owner. Sidebar: Overview, My Venues, Slots, Pricing & Offers, Bookings, Analytics, Payouts, Settings.

#### `/owner` — Dashboard
- KPIs: bookings today, revenue today/month, active venues, pending bookings, cancellations.
- Revenue line chart (7/30/90 day range).
- Bookings volume bar chart.
- Recent bookings table.

#### `/owner/venues` — Venue management
- List owner venues with sport, city, price/hr, approval badge.
- Add/Edit dialog: name, slug, sport, city, address, ₹/hr, **max players allowed**, image URL, description, confirmation mode.
- New venues **auto-approved**.
- Soft deactivate (delete) venue.

#### `/owner/slots` — Slot calendar
- Select venue + month.
- View bookings and blocks on calendar.
- Block slot (single date or recurring weekday).
- Unblock slot.

#### `/owner/pricing` — Pricing & offers
Tabs per venue:
- **Peak pricing** — time range + flat/percent surcharge.
- **Day pricing** — override per weekday.
- **Date pricing** — one-off date override.
- **Duration discounts** — min hours → discount %.
- **Coupons** — create/edit/delete codes (flat or percent).

#### `/owner/bookings`
- Filterable booking list for owner venues.
- Confirm / Reject actions (legacy manual flow; new bookings arrive confirmed).
- Refund on reject when payment exists.

#### `/owner/analytics`
- Revenue series, bookings volume, peak-hour heatmap.
- CSV export.

#### `/owner/payouts`
- Payout summary with platform commission.
- Pending payout calculation.
- Payout history.
- Save bank details (account holder, number, IFSC).

#### `/owner/settings`
- Update owner profile (name, phone, business name, city).

---

### 6.5 Admin portal (`/admin/*`)

Requires `admin` role. Sidebar: Overview, Bookings, Venues, Sports, Users, Payments, Analytics, Notifications, Owner requests, Venue approvals, Owners, Settings.

#### `/admin` — Dashboard
- KPIs: bookings today, revenue today/month, active venues, new users (7d), cancellations.
- Revenue chart, booking volume, bookings-by-sport pie, top venues.
- Recent bookings table.

#### `/admin/bookings`
- All platform bookings with filters.
- Admin cancel booking.

#### `/admin/venues`
- CRUD all venues (admin override).
- Activate/deactivate.

#### `/admin/sports`
- CRUD sports (name, slug, icon, active).

#### `/admin/users`
- User list with booking count and spend.
- Ban / unban users.

#### `/admin/payments`
- Payment ledger.
- Summary: collected, refunded, net.
- Trigger refund.

#### `/admin/analytics`
- Extended charts: monthly revenue, user growth, cancellation trend, revenue by venue.
- CSV export.

#### `/admin/notifications`
- Send broadcast in-app notification to users.
- View notification audit log.

#### `/admin/owner-requests`
- List pending owner applications.
- Approve / reject with reason + email.

#### `/admin/venue-approvals`
- List pending venues.
- Approve / reject with reason.

#### `/admin/owners`
- List approved/rejected/suspended owners.
- Update status, commission override.
- Auto-deactivate venues on owner suspension.

#### `/admin/settings`
- Read/update `site_settings` (site name, contact, commission rate, cancellation hours, etc.).

---

## 7) Server Functions (API Surface)

### 7.1 Booking (`booking.functions.ts`)

| Function | Method | Description |
|----------|--------|-------------|
| `listSports` | GET | Active sports; auto-seeds defaults if empty |
| `listVenues` | GET | Approved active venues; optional sport filter |
| `getVenue` | GET | Single venue by slug |
| `getSlots` | GET | Hourly slots with capacity (`playerCount` param) |
| `createBooking` | POST | Auth required; capacity check; pricing; payment; confirmed booking |
| `listMyBookings` | GET | Player's bookings with venue + player_count/names |

### 7.2 Owner (`owner.functions.ts`)

Registration, dashboard KPIs, revenue/volume/peak analytics, venue CRUD, slot blocks, full pricing stack, coupons, booking confirm/reject, payouts, profile, CSV export, admin owner/venue review helpers.

### 7.3 Admin (`admin.functions.ts`)

Platform KPIs, all analytics endpoints, bookings/venues/sports/users CRUD, payments/refunds, settings, notifications broadcast, ban user, CSV export.

### 7.4 Account (`account.functions.ts`)

Profile get/update, cancel booking (with refund path), notifications list/mark read, payment history.

### 7.5 Pricing engine (`pricing.ts`)

- Base hourly rate.
- Day-of-week override.
- Date-specific override.
- Peak-hour surcharge (flat or percent).
- Duration discount (best matching min_hours).
- Coupon (flat or percent).
- Output: final `total_price` for booking window.

---

## 8) Pricing Rules (Precedence)

1. Start with `venues.price_per_hour`.
2. Apply date override if exists for booking date.
3. Else apply day-of-week override.
4. For each hour, apply peak surcharge rules.
5. Sum hours → apply best duration discount.
6. Apply coupon if valid and venue-compatible.
7. **Display split:** per-person at capacity = `ceil(total / max_players_allowed)`; payable for N players = per-person × N.

---

## 9) Booking Lifecycle

| Status | Meaning |
|--------|---------|
| `confirmed` | Active booking (default for all new bookings) |
| `pending` | Legacy/manual mode (still counted in capacity) |
| `cancelled` | Cancelled by player, owner, or admin |

**Capacity counting:** `confirmed` + `pending` bookings reduce remaining slots.

---

## 10) Integrations

| Service | Usage |
|---------|--------|
| **Supabase Auth** | Signup, login, sessions, JWT |
| **Supabase DB** | All relational data + RLS |
| **Razorpay** | Payment orders, refunds |
| **Email** | Owner application decision emails |
| **Vercel** | Hosting, SSR, static assets |

---

## 11) Non-Functional Requirements

- Server-side auth middleware on protected server functions.
- RLS on Supabase tables; `has_role()` for admin checks.
- Responsive UI (mobile header menu, grid layouts).
- Real-time slot polling (5s) on booking page.
- CSV exports for owner/admin analytics.
- Error toasts (Sonner) for user feedback.

---

## 12) Known Gaps / Future Ideas

### From product backlog (not built)
- Equipment maintenance tracking (ball usage, avg life, replacement prediction).
- Inventory management for turf equipment.
- Full payout settlement automation.
- Owner KYC workflow.
- SMS / multi-channel notifications.
- Subscription plans for owners.

### Technical debt / cleanup candidates
- Admin owner-request and venue-approval flows exist but owners/venues auto-approve in current code.
- `confirmation_mode = manual` on venue is stored but ignored at booking time.
- Supabase generated types may lag behind migrations (run type regen after DB push).
- `/booking/success` links to `/dashboard` — verify route alias vs `/account`.

---

## 13) BA Review Checklist

- [ ] Confirm group booking UX: player count, names, capacity display, pricing formula.
- [ ] Confirm auto-approve policy for owners and venues is intentional.
- [ ] Confirm all bookings are instant confirmed (no pending player experience).
- [ ] Validate capacity math: partial bookings until `max_players_allowed` filled.
- [ ] Validate pricing precedence and coupon rules.
- [ ] Confirm admin role assignment process (manual DB / seed).
- [ ] Validate Razorpay production vs dev fallback behavior.
- [ ] Confirm required Supabase migrations applied in production.
- [ ] Review payout commission formula against `site_settings.platform_commission_rate`.

---

## 14) Route Map (Quick Reference)

```
/                          Home
/sports                    Venue listing (+ ?sport=slug)
/venues/:slug              Book venue
/login, /signup            Player auth
/owner/login, /owner/register
/booking/success           Confirmation

/account                   My bookings
/account/profile
/account/notifications
/account/payments

/owner                     Partner dashboard
/owner/venues
/owner/slots
/owner/pricing
/owner/bookings
/owner/analytics
/owner/payouts
/owner/settings

/admin                     Admin dashboard
/admin/bookings
/admin/venues
/admin/sports
/admin/users
/admin/payments
/admin/analytics
/admin/notifications
/admin/owner-requests
/admin/venue-approvals
/admin/owners
/admin/settings
```

---

*End of PRD*
