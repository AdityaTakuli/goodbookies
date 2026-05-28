# Good Bookies - Product Requirements Document (PRD)

## 1) Product Summary

Good Bookies is a sports venue booking marketplace with three user groups:
- Players (end customers) who discover venues and make bookings.
- Partners/Owners who manage venues, slots, pricing, and bookings.
- Admins who operate platform governance, approvals, analytics, content, and risk actions.

Core value proposition:
- Players: discover and book sports venues quickly.
- Owners: digitize venue operations and optimize revenue.
- Admin: control quality, growth, and monetization of the marketplace.

---

## 2) Roles and Access Model

## 2.1 Player
- Can sign up/login through normal auth routes.
- Can browse sports and approved active venues.
- Can view venue details and slot availability.
- Can create bookings and view own bookings.
- Can manage account profile, notifications, and payments views.

## 2.2 Owner (Partner)
- Can sign up/login via owner routes.
- Partner record exists in `owners` with statuses such as `pending`, `approved`, `rejected`, `suspended`.
- Owner dashboard and owner server actions are effectively gated by approved owner status.

## 2.3 Admin
- Determined by `user_roles` containing `admin`.
- Can review owner applications and venue approvals.
- Can manage users, sports, venues, bookings, payments, notifications, settings, and analytics.

---

## 3) Feature Inventory (One-by-One)

## 3.1 Public Website and Discovery

1. Landing/Home page with hero and navigation.
2. Sports listing page.
3. Venue listing with sport filter.
4. Venue detail page by slug (`venues.$slug`).
5. Public static media display (venue and brand assets).

## 3.2 Authentication and Account

6. Player signup.
7. Player login.
8. Owner signup (partner application submission).
9. Owner login.
10. Session-based auth state tracking.
11. Role checks for admin and owner status.

## 3.3 Player Account Area

12. Account overview page.
13. Profile management page.
14. Notifications page.
15. Payments/account billing page.
16. Booking success confirmation page.
17. My bookings list.

## 3.4 Booking Engine (Player Side)

18. Fetch active sports (`listSports`).
19. Fetch active approved venues (`listVenues`).
20. Fetch single active approved venue by slug (`getVenue`).
21. Slot availability computation (`getSlots`) with:
- Operating days checks.
- Holiday date checks.
- Existing booking conflict checks.
- Owner block slot checks (single-day + recurring).
22. Booking creation (`createBooking`) with:
- Auth required.
- Venue active + approved validation.
- Dynamic pricing computation.
- Optional coupon application.
- Payment order creation (Razorpay integration).
- Payment record creation.
- Booking record creation with status:
  - `pending` when confirmation mode is manual.
  - `confirmed` when confirmation mode is instant.
- Booking conflict handling (double-book protection).
- Notification creation for player and owner.
23. Player bookings retrieval (`listMyBookings`).

## 3.5 Pricing and Monetization Logic

24. Base hourly venue pricing.
25. Day-of-week price overrides.
26. Date-specific price overrides.
27. Peak-hour surcharge rules.
28. Duration discount rules.
29. Coupon support:
- Flat and percentage discount types.
- Optional venue-bound coupon.
- Coupon active state and usage increment.
30. Final booking total calculation via pricing engine.

## 3.6 Partner (Owner) Onboarding and Approval

31. Owner registration creates:
- Auth user.
- `owners` record with `pending` status.
32. Owner status retrieval endpoint.
33. Owner request listing for admin (pending only).
34. Admin owner review action (approve/reject) with:
- Status updates.
- Rejection reason support.
- Approval metadata (timestamp + approver).
- Owner role assignment on approve.
- Transactional email notification to applicant.

## 3.7 Owner Dashboard and Operations

35. Owner overview summary:
- Bookings today.
- Revenue today/month.
- Active venues.
- Pending bookings.
- Monthly cancellations.
36. Revenue time-series analytics.
37. Bookings volume time-series analytics.
38. Peak-hour heatmap analytics.
39. Owner CSV export for analytics.

## 3.8 Owner Venue Management

40. List owner venues.
41. Create venue (default approval pending and inactive until approved).
42. Update venue.
43. Soft delete/deactivate venue.
44. Ownership verification checks for venue actions.

## 3.9 Owner Slot Management

45. List monthly booking + block slot data.
46. Block slot (single date).
47. Block slot (recurring by weekday).
48. Unblock slot.

## 3.10 Owner Pricing and Offer Management

49. Get venue pricing config.
50. Save peak pricing rules.
51. Save day pricing rules.
52. Add/update date pricing.
53. Save duration discounts.
54. List owner coupons.
55. Create/update coupon.
56. Delete coupon.

## 3.11 Owner Booking Operations

57. List bookings with filters.
58. Confirm booking.
59. Reject booking.
60. Refund flow for rejected paid bookings.

## 3.12 Owner Payouts and Profile

61. Owner payouts summary with commission logic.
62. Payout history listing.
63. Pending payout calculation.
64. Save owner bank/payout details.
65. Update owner profile details.

## 3.13 Admin Analytics and BI

66. Admin KPI summary.
67. Revenue series chart.
68. Bookings by sport chart.
69. Top venues ranking.
70. Booking volume trend.
71. Monthly revenue breakdown.
72. User growth trend.
73. Cancellation trend.
74. Revenue by venue report.
75. Analytics CSV export.

## 3.14 Admin Bookings and Payments

76. Admin bookings listing with filters.
77. Admin booking cancellation.
78. Admin payments listing with mapped statuses.
79. Admin payments summary (collected/refunded/net).
80. Admin refund trigger on booking/payment.

## 3.15 Admin Catalog and Governance

81. List and manage venues.
82. List and manage sports.
83. Venue approval listing.
84. Venue review action (approve/reject with reason).
85. List owners (non-pending) with venue counts.
86. Update owner status/commission override.
87. Auto-deactivate venues on owner suspension.
88. List users with booking/spend stats.
89. Ban/unban users.

## 3.16 Admin Platform Ops

90. Read platform/site settings.
91. Update site settings key-value pairs.
92. Send admin broadcast notifications to users.
93. Persist notification audit log.
94. Read recent notification audit log.

## 3.17 Notifications and Communication

95. In-app notifications for booking events.
96. Owner notification for new bookings.
97. Applicant email on owner approval/rejection.
98. Admin-initiated broadcast notifications.

## 3.18 Integrations

99. Supabase:
- Auth users and sessions.
- Relational data store.
- Role and ownership authorization checks.
100. Razorpay:
- Order creation for booking payments.
- Refund APIs for admin/owner cancellations.
101. Email service:
- Partner application decision emails.

---

## 4) Core Workflows

## 4.1 Player Booking Flow
1. Player logs in.
2. Selects sport and venue.
3. Views slots for selected date.
4. Selects time range.
5. Applies coupon (optional).
6. System computes total price via pricing engine.
7. Payment order created.
8. Booking saved as `pending` or `confirmed`.
9. Notifications generated.

## 4.2 Partner Onboarding and Approval Flow
1. Partner signs up via owner registration.
2. Owner record created as `pending`.
3. Admin reviews in owner requests.
4. Admin approves/rejects with optional reason.
5. System updates owner status and sends email.
6. Approved owner accesses full partner operations.

## 4.3 Venue Approval Flow
1. Owner creates venue.
2. Venue enters `approval_status = pending`.
3. Admin reviews venue.
4. Admin approves (active) or rejects (inactive + reason).

---

## 5) Business Rules (Current)

1. Only approved + active venues appear in discovery and are bookable.
2. Slot availability excludes:
- Already booked ranges (`pending`, `confirmed`).
- Owner-defined blocked slots.
- Non-operating days and holidays.
3. Coupons only apply when active and venue-compatible.
4. Booking status depends on venue confirmation mode.
5. Owner operational APIs require approved owner checks.
6. Admin APIs require admin role checks.

---

## 6) Non-Functional Requirements (Observed)

1. Server-side authorization guards for protected operations.
2. Error handling and status-based user feedback.
3. CSV export support for analytics.
4. Role-based routing and dashboard segmentation.
5. Vercel deployment with serverless render function and static assets.

---

## 7) Out of Scope / Future Considerations

1. Fine-grained commission and payout settlement automation.
2. Rich owner KYC and compliance workflow.
3. Multi-channel notification delivery orchestration (SMS/email retries).
4. Advanced fraud/risk scoring.
5. Multi-city tax and invoicing engines.
6. Subscription plans for owners.

---

## 8) Suggested BA Review Checklist

1. Confirm role boundaries: player vs owner vs admin.
2. Confirm approval policy intent (login vs feature gating).
3. Validate booking lifecycle states and transitions.
4. Validate pricing precedence (base/day/date/peak/duration/coupon).
5. Validate payout formula and commission rules.
6. Validate notification and email requirements by event.
7. Confirm required reports/KPIs and export formats.

