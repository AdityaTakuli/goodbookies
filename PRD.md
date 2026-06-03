# Good Bookies — Product Requirements Document (PRD)

**Version:** 3.0 (Mobile App & Full Route/API Reference)  
**Last updated:** June 2026  
**Product:** Sports turf / venue booking marketplace with capacity matchmaking and open lobbies

---

## 1) Product Summary

Good Bookies is a marketplace where **players** discover venues, book hourly slots (solo or group), open **public match lobbies**, and join others’ games. **Owners** manage turfs, pricing, slots, and revenue. **Admins** govern the platform.

**Brand:** “Book the pitch. Fill the match.”

| Persona | Core jobs |
|---------|-----------|
| **Player** | Browse sports → venue → pick date/slots/players → pay → manage bookings; discover/join open lobbies |
| **Owner** | Register → manage venues → block slots → pricing/coupons → bookings → analytics → payouts |
| **Admin** | KPIs → bookings/venues/users/payments → approvals → settings → broadcasts |

---

## 2) User Roles & Access

| Role | Assignment | Web login | Gated areas |
|------|------------|-----------|-------------|
| **Player** | Default on signup | `/login`, `/signup` | `/account/*` |
| **Owner** | `owners` row + `user_roles.role = owner` | `/owner/login`, `/owner/register` | `/owner/*` (layout expects `owners.status = approved`) |
| **Admin** | `user_roles.role = admin` | `/login` | `/admin/*` |

**Policies (as-built)**
- Owner + venue creation: **auto-approved** in dev (`approved`, `is_active`, `approval_status = approved`).
- New bookings: always **`confirmed`** (`confirmation_mode` on venue ignored).
- Discovery: `venues.is_active = true` AND `approval_status = approved`.
- Capacity: multiple bookings per hour until `max_players_allowed` filled (`bookings_no_double_book` index must be dropped).

---

## 3) System Architecture

| Layer | Technology |
|-------|------------|
| Web UI | React 19, TypeScript, Tailwind 4, shadcn/ui, Framer Motion |
| Routing / SSR | TanStack Router, TanStack Start, TanStack Query |
| Validation | Zod |
| Backend | TanStack `createServerFn` (RPC over HTTPS) |
| DB & Auth | Supabase (PostgreSQL, Auth JWT, RLS) |
| Payments | Razorpay (orders, refunds; dev stub without keys) |
| Hosting | Vercel — static assets + `/api/render` Node SSR |

**Env vars (mobile + web)**
- Client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (or anon key)
- Server only: `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

---

## 4) Database Schema (Production)

### Core

| Table | Key columns |
|-------|-------------|
| `profiles` | `id`, `full_name`, `email`, `phone`, `is_banned` |
| `user_roles` | `user_id`, `role` (`admin`, `user`, `owner`) |
| `sports` | `name`, `slug`, `icon`, `is_active` |
| `venues` | `slug`, `sport_id`, `owner_id`, `city`, `price_per_hour`, `opening_hour`, `closing_hour`, **`max_players_allowed`**, `operating_days[]`, `holiday_dates[]`, `approval_status`, `is_active` |
| `bookings` | `user_id`, `venue_id`, `booking_date`, `start_hour`, `end_hour`, **`player_count`**, **`player_names[]`**, **`is_open_lobby`**, `total_price`, `status`, `payment_id` |
| `lobby_queries` | `booking_id`, `seeker_id`, `player_count`, `player_names[]`, `status` (`pending`/`accepted`/`rejected`/`expired`), `payment_id` |
| `payments` | `amount`, `razorpay_order_id`, `status`, `booking_id`, `user_id` |
| `notifications` | `user_id`, `title`, `message`, `type`, `is_read` |

### Owner / pricing

`owners`, `slot_blocks`, `venue_peak_pricing`, `venue_day_pricing`, `venue_date_pricing`, `venue_duration_discounts`, `coupons`, `owner_payout_details`, `payouts`

### Admin

`site_settings`, `admin_notification_log`

---

## 5) Business Rules

### 5.1 Capacity & pricing

- `remaining_capacity(hour) = max_players_allowed − Σ player_count` (bookings `confirmed` + `pending` overlapping hour).
- **Payable (host booking):** `ceil(full_hourly_total / max_players_allowed) × player_count`.
- **Payable (lobby join):** same formula × seeker `player_count` after host accepts.
- Slot UI: **Vacant** (0 booked), **Partial** (amber, `X/Y left`), **Full** (blocked).
- Poll slots every **5s** on venue detail and open lobbies list.

### 5.2 Open lobbies

- Host enables `is_open_lobby` when `player_count < max_players_allowed`.
- Seeker: `submitLobbyQuery` → `pending` → host `acceptLobbyQuery` / `declineLobbyQuery`.
- On accept: merge `player_names`, increment `player_count`; if full, expire other `pending` queries.
- List: `listOpenLobbies` where `is_open_lobby = true` and `player_count < max`.

### 5.3 Booking status

| Status | Capacity | Notes |
|--------|----------|-------|
| `confirmed` | Counts | Default for all new bookings |
| `pending` | Counts | Legacy manual flow |
| `cancelled` | Released | Player/owner/admin cancel |

---

## 6) Mobile App Development Guide

### 6.1 Recommended stack

| Layer | Suggestion |
|-------|------------|
| App | React Native (Expo) or Flutter |
| Auth | `@supabase/supabase-js` — email/password, session refresh |
| API | Call **same server functions** as web (see §8) OR add a REST wrapper later |
| Payments | Razorpay native SDK — use `razorpayOrderId` from `createBooking` / `submitLobbyQuery` |
| Realtime (optional) | Supabase Realtime on `bookings` / `lobby_queries` for live lobby updates |

### 6.2 Authentication flow

1. `supabase.auth.signUp` / `signInWithPassword` → store `session.access_token`.
2. Attach to every protected API call: `Authorization: Bearer <access_token>`.
3. Role flags (client-side, same as web):
   - **Admin:** `user_roles` where `role = 'admin'`.
   - **Owner:** `owners` where `id = user.id` and `status = 'approved'`.
4. Block banned users: `profiles.is_banned = true` → `getMyProfile` throws.

**Owner registration:** use server fn `registerOwner` (creates auth user server-side); then login via `signInWithPassword`.

### 6.3 Calling backend APIs from mobile

Web app uses **TanStack Start server functions** (`createServerFn`). Mobile should:

1. **Preferred (short term):** Proxy through your deployed web origin — inspect browser Network tab on production for the RPC URL pattern TanStack emits (POST + JSON body with function id + `data` payload). Send the same request with `Authorization: Bearer <jwt>`.
2. **Alternative:** Duplicate critical endpoints as **Supabase Edge Functions** or a **REST layer** (not in repo today).
3. **Do not** use service role key in the mobile app.

**Public (no JWT):** `listSports`, `listVenues`, `getVenue`, `getSlots`, `listOpenLobbies`  
**Authenticated:** everything else in §8 marked `Auth`

### 6.4 Mobile navigation map (suggested)

```
App
├── Auth Stack (guest)
│   ├── Welcome          ← web /
│   ├── Login            ← /login
│   ├── Signup           ← /signup
│   ├── Owner Login      ← /owner/login
│   └── Owner Register   ← /owner/register
├── Player Tabs (player)
│   ├── Home             ← /
│   ├── Sports           ← /sports
│   ├── Open Lobbies     ← /lobbies
│   └── Account          ← /account/*
├── Booking Flow (modal/stack)
│   ├── Venue Detail     ← /venues/:slug
│   └── Booking Success  ← /booking/success?id=
└── Partner / Admin (role-gated stacks)
    ├── Owner *          ← /owner/*
    └── Admin *          ← /admin/*
```

### 6.5 Mobile screen checklist by priority

**P0 — Player MVP**
- [ ] Sports list + venue list + filters
- [ ] Venue detail: date, player count, names, slot grid, price breakdown, book
- [ ] Open lobbies list + join request modal
- [ ] My bookings + host join requests + sent requests
- [ ] Profile, notifications, payment history
- [ ] Login/signup + Razorpay checkout

**P1 — Owner**
- [ ] Dashboard KPIs + charts
- [ ] Venues CRUD, slot blocks, pricing tabs, coupons
- [ ] Bookings list, payouts, settings

**P2 — Admin**
- [ ] Full admin console (usually web-only; optional on tablet)

---

## 7) Complete Web Route & Feature Catalog

> Use **Route** as path on web. **Mobile screen** is the suggested app equivalent. **APIs** are server functions (§8).

### 7.1 Public routes

| Route | Auth | Mobile screen | Features | APIs |
|-------|------|---------------|----------|------|
| `/` | — | Home | Hero, sports grid, CTAs “Book turf” / “Join match” | `listSports` |
| `/sports` | — | Venue list | Filter by `?sport=slug`; venue cards (image, city, price, rating) | `listSports`, `listVenues` |
| `/venues/$slug` | —* | Venue detail | Date picker; player count; name inputs; open-lobby checkbox; slot grid (5s poll); price card; Book Now → login if guest | `getVenue`, `getSlots`, `createBooking` |
| `/lobbies` | —* | Open matches | Filter sport + date; capacity bar; “Request to join” modal | `listSports`, `listOpenLobbies`, `submitLobbyQuery` |
| `/login` | — | Login | Email/password; `?redirect=` deep link | Supabase Auth |
| `/signup` | — | Signup | Email, password, name → profile | Supabase Auth |
| `/owner/login` | — | Owner login | Partner branding; status hints | Supabase Auth |
| `/owner/register` | — | Owner signup | Business fields; auto-approve | `registerOwner` |
| `/booking/success` | — | Confirmation | `?id=bookingId`; links to bookings / sports | — |
| `/dashboard` | — | — | **Redirects to `/account`** | — |

\*Guest can browse; book/join requires auth.

### 7.2 Player account (`/account`)

| Route | Auth | Mobile screen | Features | APIs |
|-------|------|---------------|----------|------|
| `/account` | Player | My bookings | Upcoming / Past / Cancelled; open-lobby badge; **host:** pending join requests Accept/Reject; **seeker:** sent requests status; Cancel booking; Re-book | `listMyBookings`, `listPendingQueriesForHost`, `listMyLobbyQueries`, `acceptLobbyQuery`, `declineLobbyQuery`, `cancelMyBooking` |
| `/account/profile` | Player | Profile | Edit name, phone | `getMyProfile`, `updateMyProfile` |
| `/account/notifications` | Player | Notifications | In-app list; mark all read | `listMyNotifications`, `markNotificationsRead` |
| `/account/payments` | Player | Payment history | Booking-linked payment rows | `listMyPayments` |

### 7.3 Owner portal (`/owner`)

| Route | Auth | Features | APIs |
|-------|------|----------|------|
| `/owner` | Owner | KPIs (today/month bookings, revenue, venues, pending, cancellations); revenue + volume charts (7/30/90d); recent bookings | `ownerSummary`, `ownerRevenueSeries`, `ownerBookingsVolume` |
| `/owner/venues` | Owner | List/create/edit venues; `max_players_allowed`; soft delete; auto-approve | `ownerListVenues`, `ownerUpsertVenue`, `ownerDeleteVenue` |
| `/owner/slots` | Owner | Calendar; block/unblock slots (date or recurring weekday) | `ownerListSlots`, `ownerBlockSlot`, `ownerUnblockSlot` |
| `/owner/pricing` | Owner | Peak / day / date pricing; duration discounts; coupons CRUD | `ownerGetPricing`, `ownerSavePeakPricing`, `ownerSaveDayPricing`, `ownerAddDatePricing`, `ownerSaveDurationDiscounts`, `ownerListCoupons`, `ownerUpsertCoupon`, `ownerDeleteCoupon` |
| `/owner/bookings` | Owner | All venue bookings; legacy confirm/reject | `ownerListBookings`, `ownerConfirmBooking`, `ownerRejectBooking` |
| `/owner/analytics` | Owner | Revenue, volume, peak hours; CSV export | `ownerRevenueSeries`, `ownerBookingsVolume`, `ownerPeakHours`, `ownerExportAnalyticsCsv` |
| `/owner/payouts` | Owner | Commission, pending balance, history, bank details | `ownerGetPayouts`, `ownerSavePayoutDetails` |
| `/owner/settings` | Owner | Owner profile update | `ownerUpdateProfile`, `getOwnerStatus` |

Layout gate: logged in + `getOwnerStatus.status === 'approved'` (except login/register paths).

### 7.4 Admin portal (`/admin`)

| Route | Auth | Features | APIs |
|-------|------|----------|------|
| `/admin` | Admin | Platform KPIs; charts; recent bookings | `adminSummary`, `adminRevenueSeries`, `adminBookingsBySport`, `adminTopVenues`, `adminListBookings` |
| `/admin/bookings` | Admin | All bookings; cancel; player names column | `adminListBookings`, `adminCancelBooking` |
| `/admin/venues` | Admin | CRUD venues; activate/deactivate | `adminListVenues`, `adminUpsertVenue`, `adminDeleteVenue` |
| `/admin/sports` | Admin | CRUD sports | `adminListSports`, `adminUpsertSport` |
| `/admin/users` | Admin | Users + spend; ban/unban | `adminListUsers`, `adminBanUser` |
| `/admin/payments` | Admin | Ledger; summary; refund | `adminListPayments`, `adminPaymentsSummary`, `adminRefundPayment` |
| `/admin/analytics` | Admin | Extended charts; CSV | `adminMonthlyRevenue`, `adminUserGrowth`, `adminCancellationTrend`, `adminRevenueByVenue`, `adminBookingsVolume`, `adminExportAnalyticsCsv` |
| `/admin/notifications` | Admin | Broadcast + audit log | `adminSendNotification`, `adminNotificationLog` |
| `/admin/owner-requests` | Admin | Approve/reject pending owners | `adminListOwnerRequests`, `adminReviewOwnerRequest` |
| `/admin/venue-approvals` | Admin | Approve/reject pending venues | `adminListVenueApprovals`, `adminReviewVenue` |
| `/admin/owners` | Admin | Manage owners; commission override; suspend | `adminListOwners`, `adminUpdateOwner` |
| `/admin/settings` | Admin | `site_settings` key-value | `adminGetSettings`, `adminUpdateSettings` |

---

## 8) Server Functions — Full API Reference

**Auth legend:** `—` public · `JWT` requires `Authorization: Bearer <supabase_access_token>`

### 8.1 `booking.functions.ts`

| Function | HTTP | Auth | Input (`data`) | Output / behavior |
|----------|------|------|----------------|-------------------|
| `listSports` | GET | — | — | `{ id, name, slug, icon }[]`; seeds defaults if empty |
| `listVenues` | GET | — | `{ sport?: string }` | Approved active venues + sport join |
| `getVenue` | GET | — | `{ slug: string }` | Single venue + sport |
| `getSlots` | GET | — | `{ venueId, date: YYYY-MM-DD, playerCount?: number }` | `[{ hour, available, status, remaining_capacity, booked_players, total_capacity, open_lobby_booking_id?, is_private_game? }]` |
| `createBooking` | POST | JWT | `{ venueId, date, startHour, endHour, playerCount, playerNames[], isOpenLobby?, couponCode? }` | Capacity check; pricing; Razorpay order; `{ bookingId, total, fullTotal, razorpayOrderId, status, isOpenLobby }` |
| `listMyBookings` | POST | JWT | — | Bookings + venue + `is_open_lobby` |

### 8.2 `lobby.functions.ts`

| Function | HTTP | Auth | Input | Output |
|----------|------|------|-------|--------|
| `listOpenLobbies` | GET | — | `{ sport?, date? }` | Open bookings + host profile + `spots_open` |
| `submitLobbyQuery` | POST | JWT | `{ bookingId, playerCount, playerNames[] }` | `{ queryId, amount }` + notify host |
| `acceptLobbyQuery` | POST | JWT | `{ queryId }` | Merge players; payment success; expire others if full |
| `declineLobbyQuery` | POST | JWT | `{ queryId }` | Reject + cancel payment hold |
| `listPendingQueriesForHost` | GET | JWT | — | Pending queries on host’s open bookings + seeker profile |
| `listMyLobbyQueries` | GET | JWT | — | Seeker’s queries + booking/venue |

### 8.3 `account.functions.ts`

| Function | HTTP | Auth | Input | Output |
|----------|------|------|-------|--------|
| `getMyProfile` | GET | JWT | — | Profile row; fails if banned |
| `updateMyProfile` | POST | JWT | `{ full_name?, phone? }` | `{ ok: true }` |
| `cancelMyBooking` | POST | JWT | `{ id }` | Respects `site_settings.cancellation_hours` |
| `listMyNotifications` | GET | JWT | — | Last 50 notifications |
| `markNotificationsRead` | POST | JWT | — | Mark all unread read |
| `listMyPayments` | GET | JWT | — | Derived payment history from bookings |

### 8.4 `owner.functions.ts`

| Function | HTTP | Auth | Input (summary) |
|----------|------|------|-----------------|
| `registerOwner` | POST | — | `{ name, email, phone, password, city, business_name? }` |
| `getOwnerStatus` | GET | JWT | — |
| `ownerSummary` | GET | JWT | — |
| `ownerRevenueSeries` | GET | JWT | `{ days: 7\|30\|90 }` |
| `ownerBookingsVolume` | GET | JWT | `{ days }` |
| `ownerPeakHours` | GET | JWT | — |
| `ownerListVenues` | GET | JWT | — |
| `ownerUpsertVenue` | POST | JWT | Venue payload + optional `id` |
| `ownerDeleteVenue` | POST | JWT | `{ id }` |
| `ownerListSlots` | GET | JWT | `{ venueId, month? }` |
| `ownerBlockSlot` | POST | JWT | Block window + recurring flags |
| `ownerUnblockSlot` | POST | JWT | `{ id, venueId }` |
| `ownerGetPricing` | GET | JWT | `{ venueId }` |
| `ownerSavePeakPricing` | POST | JWT | `{ venueId, rules[] }` |
| `ownerSaveDayPricing` | POST | JWT | `{ venueId, rules[] }` |
| `ownerAddDatePricing` | POST | JWT | `{ venueId, date, price_override }` |
| `ownerSaveDurationDiscounts` | POST | JWT | `{ venueId, rules[] }` |
| `ownerListCoupons` | GET | JWT | — |
| `ownerUpsertCoupon` | POST | JWT | Coupon fields |
| `ownerDeleteCoupon` | POST | JWT | `{ id }` |
| `ownerListBookings` | GET | JWT | Filters optional |
| `ownerConfirmBooking` | POST | JWT | `{ id }` |
| `ownerRejectBooking` | POST | JWT | `{ id }` + refund path |
| `ownerGetPayouts` | GET | JWT | — |
| `ownerSavePayoutDetails` | POST | JWT | Bank fields |
| `ownerUpdateProfile` | POST | JWT | Owner profile fields |
| `ownerExportAnalyticsCsv` | GET | JWT | CSV string |
| `adminListOwnerRequests` | GET | JWT (admin) | — |
| `adminReviewOwnerRequest` | POST | JWT (admin) | `{ id, approved, reason? }` |
| `adminListVenueApprovals` | GET | JWT (admin) | — |
| `adminReviewVenue` | POST | JWT (admin) | `{ id, approved, reason? }` |
| `adminListOwners` | GET | JWT (admin) | — |
| `adminUpdateOwner` | POST | JWT (admin) | Status / commission |

### 8.5 `admin.functions.ts`

| Function | HTTP | Auth | Purpose |
|----------|------|------|---------|
| `adminSummary` | GET | Admin | Dashboard KPIs |
| `adminRevenueSeries` | GET | Admin | Revenue chart |
| `adminBookingsBySport` | GET | Admin | Pie data |
| `adminTopVenues` | GET | Admin | Top venues |
| `adminListBookings` | GET | Admin | All bookings + players |
| `adminCancelBooking` | POST | Admin | `{ id }` |
| `adminListVenues` | GET | Admin | — |
| `adminUpsertVenue` | POST | Admin | Venue CRUD |
| `adminDeleteVenue` | POST | Admin | `{ id }` |
| `adminListSports` | GET | Admin | — |
| `adminUpsertSport` | POST | Admin | Sport CRUD |
| `adminListUsers` | GET | Admin | CRM list |
| `adminBookingsVolume` | GET | Admin | Chart |
| `adminMonthlyRevenue` | GET | Admin | Chart |
| `adminUserGrowth` | GET | Admin | Chart |
| `adminCancellationTrend` | GET | Admin | Chart |
| `adminRevenueByVenue` | GET | Admin | Chart |
| `adminListPayments` | GET | Admin | Ledger |
| `adminPaymentsSummary` | GET | Admin | Totals |
| `adminGetSettings` | GET | Admin | Key-value settings |
| `adminUpdateSettings` | POST | Admin | `{ settings: Record }` |
| `adminSendNotification` | POST | Admin | Broadcast |
| `adminNotificationLog` | GET | Admin | Audit |
| `adminRefundPayment` | POST | Admin | `{ bookingId }` |
| `adminExportAnalyticsCsv` | GET | Admin | CSV |
| `adminBanUser` | POST | Admin | `{ id, banned }` |

### 8.6 Pricing (`pricing.ts` — internal)

`loadVenuePricing(venueId)` + `calculateBookingTotal(...)` — used by `createBooking`; mobile should rely on `createBooking` response totals, not reimplement unless duplicating rules in §9.

---

## 9) Pricing Precedence

1. `venues.price_per_hour`
2. Date override (`venue_date_pricing`)
3. Day-of-week override (`venue_day_pricing`)
4. Per-hour peak surcharge (`venue_peak_pricing`)
5. Duration discount on subtotal (`venue_duration_discounts`)
6. Coupon (`coupons`)
7. Display: `perPerson = ceil(total / max_players_allowed)`; charge = `perPerson × player_count`

---

## 10) Key User Flows (for mobile UX)

### Flow A — Book a turf
```
Sports → Venues → Venue Detail → [Login] → Select date/hours/players/names
→ [Optional: Open lobby] → createBooking → Razorpay → Success → My Bookings
```

### Flow B — Join open match
```
Open Lobbies → Card → Join modal (count + names) → submitLobbyQuery
→ Host accepts on My Bookings → Seeker sees "Approved"
```

### Flow C — Host manages join requests
```
My Bookings → Incoming requests → Accept / Reject
```

### Flow D — Owner day
```
Owner Login → Dashboard → Venues / Slots / Pricing / Bookings / Payouts
```

---

## 11) Route Trees (Quick Reference)

### Public + player
```
/
/sports                    ?sport=football|cricket|badminton|basketball
/venues/:slug
/lobbies
/login, /signup
/booking/success           ?id=<uuid>
/dashboard                 → redirects /account

/account
/account/profile
/account/notifications
/account/payments
```

### Owner
```
/owner/login
/owner/register
/owner
/owner/venues
/owner/slots
/owner/pricing
/owner/bookings
/owner/analytics
/owner/payouts
/owner/settings
```

### Admin
```
/admin
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

## 12) Integrations & NFR

| Service | Usage |
|---------|--------|
| Supabase Auth | JWT sessions |
| Supabase DB | All data; RLS on client reads |
| Razorpay | Orders + refunds |
| Email | Owner approval emails |
| Vercel | Web hosting only |

- Protected server functions validate JWT via `requireSupabaseAuth`.
- Mobile: secure token storage (Keychain/Keystore).
- Poll or Realtime for slot/lobby freshness.
- Deep links: `goodbookies://venues/{slug}`, `?redirect=` parity with web.

---

## 13) Known Gaps / Mobile Backlog

- No dedicated REST OpenAPI — server functions only (add BFF or Edge Functions for native).
- Razorpay escrow/webhooks for lobby holds are simplified (dev auto-success without keys).
- `confirmation_mode = manual` stored but ignored.
- Owner/venue admin approval UIs exist but auto-approve in code.
- Push notifications (FCM/APNs) not implemented — in-app only.
- No reviews/ratings write API.
- `/booking/success` still links “View bookings” → `/dashboard` (redirects to `/account`).

---

## 14) Verification Checklist

- [ ] DB: `lobby_queries`, `is_open_lobby`, capacity columns; no `bookings_no_double_book` index
- [ ] Mobile auth + Bearer on protected endpoints
- [ ] Slot polling / capacity math under concurrent bookings
- [ ] Open lobby: submit → accept → merged `player_names`
- [ ] Razorpay production keys + mobile SDK checkout
- [ ] Owner auto-approve policy confirmed for production
- [ ] Admin role seeded for ops accounts

---

*End of PRD v3.0*
