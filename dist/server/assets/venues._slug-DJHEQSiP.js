import { _ as reactExports, Q as jsxRuntimeExports, l as createServerFn } from "./server-Cz7outt5.js";
import { m as createLucideIcon, _ as toast, j as cn, a0 as useAuth, a3 as useQueryClient, B as Button, d as Route, a4 as venueQO, a2 as useNavigate, l as createBooking, t as getSlots, h as breadcrumbJsonLd, V as sportsActivityVenueJsonLd, L as Link } from "./router-BGRAZzL_.js";
import { u as useQuery } from "./useQuery-Cq7su9C6.js";
import { u as useSuspenseQuery } from "./useSuspenseQuery-NSZprwQT.js";
import { u as useServerFn } from "./useServerFn-BV3limxs.js";
import { g as formatMinBookingDuration, l as isRangeAvailable, p as visualTilesFromAnchors, c as bookingRangeFromAnchors, h as formatSlotRange, i as formatSlotTime, b as bookingDurationHours, n as slotStepMinutes, j as isContiguousSlots, s as slotPriceTotal } from "./slot-time-B-rvYjC-.js";
import { c as createSsrRpc, a as resolveMediaUrlAbsolute, b as resolveVenueImage } from "./urls-BOD6FZ-M.js";
import { r as requireSupabaseAuth } from "./auth-middleware-DNN0xV3Z.js";
import { o as objectType, s as stringType, n as numberType } from "./types-DeUvCBv7.js";
import { T as Textarea } from "./textarea-DcErDiHy.js";
import { S as Star } from "./star-CL-F7b8Z.js";
import { r as resolveMinBookingMinutes, w as withVenueExtras, a as computeBookingCharge, I as INDIVIDUAL_BOOKING_SURCHARGE } from "./venue-extras-CCPlaewd.js";
import { E as ExternalLink } from "./external-link-C0M77W3u.js";
import { C as CreditCard } from "./credit-card-0eAm9UxH.js";
import { I as IndianRupee } from "./indian-rupee-BCzno-Ny.js";
import { M as MIN_ORDER_PAISE } from "./checkout-B66VBp1z.js";
import { r as readPublicRazorpayKeyId } from "./client-BjQiAFWG.js";
import { J as JsonLd } from "./JsonLd-CkjXRL0n.js";
import { m as motion } from "./proxy-zaBXCjbY.js";
import { M as MapPin } from "./map-pin-BXfO54hP.js";
import { C as Clock } from "./clock-nBhGKtyW.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-D_FJ0kB-.js";
import "./index-BlRNeFf7.js";
import "./client.server-CQTuKCic.js";
import "./razorpay-DwVM9bks.js";
import "node:crypto";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      key: "18887p"
    }
  ]
];
const MessageSquare = createLucideIcon("message-square", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const ShieldCheck = createLucideIcon("shield-check", __iconNode);
function SlotPicker({
  slots,
  selected,
  stepMinutes,
  minBookingMinutes,
  onChange
}) {
  const [startMinute, setStartMinute] = reactExports.useState(null);
  const [hoverMinute, setHoverMinute] = reactExports.useState(null);
  const [confirmedEnd, setConfirmedEnd] = reactExports.useState(null);
  const availableMinutes = new Set(
    slots.filter((s) => s.available).map((s) => s.startMinute)
  );
  const tryCommit = reactExports.useCallback(
    (start, end) => {
      const booking2 = bookingRangeFromAnchors(start, end, stepMinutes);
      if (booking2.durationMinutes < minBookingMinutes) {
        toast.error(
          `Minimum booking is ${formatMinBookingDuration(minBookingMinutes) ?? `${minBookingMinutes} minutes`}`
        );
        return false;
      }
      if (booking2.slotStarts.length === 0) {
        toast.error("Please pick a valid time range");
        return false;
      }
      if (!isRangeAvailable(booking2.slotStarts, availableMinutes)) {
        toast.error("Some slots in that range are unavailable");
        return false;
      }
      onChange(booking2.slotStarts);
      setConfirmedEnd(end);
      return true;
    },
    [availableMinutes, minBookingMinutes, onChange, stepMinutes]
  );
  const handleSlotClick = (minute) => {
    const pickingEnd = startMinute != null;
    if (!pickingEnd && !availableMinutes.has(minute)) return;
    if (!pickingEnd) {
      setStartMinute(minute);
      setHoverMinute(minute);
      setConfirmedEnd(null);
      onChange([]);
      return;
    }
    if (tryCommit(startMinute, minute)) {
      setStartMinute(null);
      setHoverMinute(null);
    }
  };
  const waitingForEnd = startMinute != null;
  const confirmedStart = selected.length > 0 ? selected[0] : null;
  const anchorA = waitingForEnd ? startMinute : confirmedStart;
  const anchorB = waitingForEnd ? hoverMinute ?? startMinute : confirmedEnd;
  const highlighted = anchorA != null && anchorB != null ? new Set(visualTilesFromAnchors(anchorA, anchorB, stepMinutes)) : /* @__PURE__ */ new Set();
  const booking = anchorA != null && anchorB != null && anchorA !== anchorB ? bookingRangeFromAnchors(anchorA, anchorB, stepMinutes) : anchorA != null ? bookingRangeFromAnchors(anchorA, anchorA, stepMinutes) : null;
  const showSummary = !waitingForEnd && confirmedStart != null && confirmedEnd != null && booking;
  const showPreview = waitingForEnd && hoverMinute != null && hoverMinute !== startMinute && booking;
  const rangeLabel = showSummary || showPreview ? formatSlotRange(booking.startMinute, booking.endMinute) : waitingForEnd && startMinute != null ? `${formatSlotTime(startMinute)} — tap end time` : null;
  const rangeHours = booking ? bookingDurationHours(booking.durationMinutes) : 0;
  const previewInvalid = waitingForEnd && booking != null && booking.slotStarts.length > 0 && !isRangeAvailable(booking.slotStarts, availableMinutes);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 bg-pitch opacity-25" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-x-6 top-1/2 h-px bg-white/20" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" }),
    waitingForEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "relative mb-2 text-xs font-medium text-primary", children: [
      "Start: ",
      formatSlotTime(startMinute),
      " — tap your end time"
    ] }),
    rangeLabel && (showSummary || showPreview) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "relative mb-4 text-sm font-medium text-foreground", children: [
      waitingForEnd ? "Preview" : "Selected",
      ": ",
      rangeLabel,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-muted-foreground", children: [
        "(",
        rangeHours,
        " hour",
        rangeHours === 1 ? "" : "s",
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6", children: slots.map((slot) => {
      const isHighlighted = highlighted.has(slot.startMinute);
      const isStartTap = waitingForEnd && startMinute === slot.startMinute || !waitingForEnd && confirmedStart === slot.startMinute;
      const isEndTap = waitingForEnd && hoverMinute === slot.startMinute && hoverMinute !== startMinute || !waitingForEnd && confirmedEnd === slot.startMinute;
      const isFull = slot.status === "booked" || (slot.remaining_capacity ?? 0) <= 0;
      const isVacant = !isFull && (slot.booked_players ?? 0) === 0;
      const isPartial = !isFull && (slot.booked_players ?? 0) > 0;
      const hasOpenLobby = Boolean(slot.open_lobby_booking_id);
      const showInvalid = isHighlighted && previewInvalid;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          disabled: !slot.available && !waitingForEnd,
          onClick: () => handleSlotClick(slot.startMinute),
          onMouseEnter: () => {
            if (waitingForEnd) setHoverMinute(slot.startMinute);
          },
          className: cn(
            "relative rounded-xl border px-2 py-3 text-sm font-medium transition-colors duration-150",
            isFull && !isHighlighted && "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground line-through",
            isPartial && slot.available && !isHighlighted && "border-amber-500/40 bg-amber-500/10 text-foreground hover:border-amber-500",
            isVacant && slot.available && !isHighlighted && "border-emerald-500/40 bg-emerald-500/10 text-foreground hover:border-emerald-500",
            !isFull && !isPartial && !isVacant && slot.available && !isHighlighted && "border-primary/30 bg-background/60 text-foreground hover:border-primary hover:bg-primary/10",
            isHighlighted && !showInvalid && "border-primary bg-primary text-primary-foreground glow-primary",
            isHighlighted && showInvalid && "border-destructive bg-destructive/20 text-destructive"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatSlotTime(slot.startMinute) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] opacity-80", children: isFull && !isHighlighted ? "Full" : isVacant && !isHighlighted ? "Vacant" : isStartTap ? "Start" : isEndTap ? "End" : isHighlighted ? "Selected" : `${slot.remaining_capacity ?? 0}/${slot.total_capacity ?? 0} left` }),
            hasOpenLobby && !isFull && !isHighlighted && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[9px] font-semibold text-primary", children: "Join match" }),
            slot.is_private_game && isPartial && !isHighlighted && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[9px] text-muted-foreground", children: "Private" })
          ]
        },
        slot.startMinute
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-5 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Step 1:" }),
        " tap start ·",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Step 2:" }),
        " tap end. Both taps and all tiles between highlight. Duration = end − start. Minimum",
        " ",
        formatMinBookingDuration(minBookingMinutes) ?? `${minBookingMinutes} minutes`,
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm border border-primary/40 bg-background" }),
          " Available"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm bg-primary glow-primary" }),
          " Selected range"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-3 w-3 rounded-sm bg-muted/60" }),
          " Booked"
        ] })
      ] })
    ] })
  ] });
}
const getVenueReviewSummary = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  venueId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("22528b7ac4107cf764eb776714a3451ede0a14010118f92adaf42bb45b0b7b27"));
const listVenueReviews = createServerFn({
  method: "GET"
}).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  limit: numberType().int().min(1).max(50).default(20)
}).parse(input)).handler(createSsrRpc("0393ae12b7e9ee8887eb8f3d2b7472bd5365ed46889b244c7fb2a1a5acf1cbfd"));
const getMyVenueReviewState = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  venueId: stringType().uuid()
}).parse(input)).handler(createSsrRpc("d12ba334c8b70e2cbd1c9be5606f6f7e247300938cf0719ee13a33d44e55ad1a"));
const submitVenueReview = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  venueId: stringType().uuid(),
  rating: numberType().int().min(1).max(5),
  comment: stringType().trim().min(10).max(2e3)
}).parse(input)).handler(createSsrRpc("a286131a78b19b5f9476fb6e0dc67d4962d48d92503ee648cf6b354af0e98b8d"));
function StarRow({
  value,
  size = "sm",
  interactive = false,
  onChange
}) {
  const sizeClass = size === "lg" ? "h-7 w-7" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const [hover, setHover] = reactExports.useState(0);
  const display = interactive ? hover || value : value;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-0.5", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      disabled: !interactive,
      onClick: () => onChange?.(star),
      onMouseEnter: () => interactive && setHover(star),
      onMouseLeave: () => interactive && setHover(0),
      className: interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default",
      "aria-label": `${star} star${star === 1 ? "" : "s"}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Star,
        {
          className: `${sizeClass} ${star <= display ? "fill-primary text-primary" : "text-muted-foreground/40"}`
        }
      )
    },
    star
  )) });
}
function formatReviewDate(iso) {
  return new Date(iso).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function VenueReviews({ venueId, venueName }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const summaryFn = useServerFn(getVenueReviewSummary);
  const listFn = useServerFn(listVenueReviews);
  const stateFn = useServerFn(getMyVenueReviewState);
  const submitFn = useServerFn(submitVenueReview);
  const [rating, setRating] = reactExports.useState(0);
  const [comment, setComment] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [showForm, setShowForm] = reactExports.useState(false);
  const { data: summary } = useQuery({
    queryKey: ["venue-review-summary", venueId],
    queryFn: () => summaryFn({ data: { venueId } })
  });
  const { data: reviews } = useQuery({
    queryKey: ["venue-reviews", venueId],
    queryFn: () => listFn({ data: { venueId, limit: 20 } })
  });
  const { data: myState } = useQuery({
    queryKey: ["my-venue-review", venueId],
    queryFn: () => stateFn({ data: { venueId } }),
    enabled: Boolean(user)
  });
  const total = summary?.totalReviews ?? 0;
  const avg = summary?.averageRating;
  const distribution = summary?.distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["venue-review-summary", venueId] });
    qc.invalidateQueries({ queryKey: ["venue-reviews", venueId] });
    qc.invalidateQueries({ queryKey: ["my-venue-review", venueId] });
    qc.invalidateQueries({ queryKey: ["venue", venueId] });
  };
  const openForm = () => {
    if (myState?.myReview) {
      setRating(myState.myReview.rating);
      setComment(myState.myReview.comment);
    }
    setShowForm(true);
  };
  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters of feedback");
      return;
    }
    setSubmitting(true);
    try {
      await submitFn({ data: { venueId, rating, comment: comment.trim() } });
      toast.success(myState?.myReview ? "Review updated" : "Thanks for your review!");
      setShowForm(false);
      invalidate();
    } catch (e) {
      toast.error(e.message ?? "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "reviews", className: "mt-10 scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 font-display text-2xl font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-6 w-6 text-primary" }),
          "Reviews"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "Player feedback for ",
          venueName,
          ", like Google reviews for turfs"
        ] })
      ] }),
      user && myState?.canReview && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: openForm, children: myState.myReview ? "Edit your review" : "Write a review" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-6 md:grid-cols-[220px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-background/50 p-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-5xl font-bold", children: avg != null ? avg.toFixed(1) : "N/A" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRow, { value: Math.round(avg ?? 0), size: "md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
          total,
          " review",
          total === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star] ?? 0;
        const pct = total > 0 ? Math.round(count / total * 100) : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-8 text-muted-foreground", children: [
            star,
            "★"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 flex-1 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: { width: `${pct}%` } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-right text-muted-foreground", children: count })
        ] }, star);
      }) })
    ] }),
    user && !myState?.canReview && !myState?.myReview && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground", children: "Book and play here first, then you can leave a review for this turf." }),
    showForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-xl border border-primary/30 bg-primary/5 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: myState?.myReview ? "Update your review" : "Share your experience" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm text-muted-foreground", children: "Your rating" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRow, { value: rating, size: "lg", interactive: true, onChange: setRating })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm text-muted-foreground", children: "Your feedback" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: comment,
            onChange: (e) => setComment(e.target.value),
            placeholder: "How was the pitch, facilities, staff, and value for money?",
            rows: 4,
            maxLength: 2e3
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          comment.length,
          "/2000 · min 10 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, disabled: submitting, children: submitting ? "Saving…" : myState?.myReview ? "Update review" : "Post review" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setShowForm(false), children: "Cancel" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 space-y-4", children: (reviews ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No reviews yet. Be the first to share feedback after you play." }) : reviews.map((review) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-xl border border-border/60 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: review.authorName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            formatReviewDate(review.createdAt),
            review.isEdited ? " · edited" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StarRow, { value: review.rating, size: "sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-foreground/90", children: review.comment })
    ] }, review.id)) })
  ] });
}
function formatShape(venueType) {
  if (!venueType) return null;
  const map = {
    rectangle: "Rectangular",
    circular: "Circular",
    outdoor: "Outdoor"
  };
  return map[venueType.toLowerCase()] ?? venueType.charAt(0).toUpperCase() + venueType.slice(1);
}
function formatMinBooking(minutes) {
  return formatMinBookingDuration(minutes);
}
function isOpen24Hours(opening, closing) {
  return opening === 0 && (closing ?? 0) >= 24;
}
function hasCricketEquipment(amenities) {
  return amenities?.some((a) => /cricket equipment/i.test(a)) ?? false;
}
function Spec({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-card/50 px-3 py-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm font-semibold text-foreground", children: value })
  ] });
}
function VenueDetailSpecs({ venue }) {
  const shape = formatShape(venue.venue_type);
  const size = venue.area_sq_ft != null ? `${venue.area_sq_ft.toLocaleString("en-IN")} sq ft` : null;
  const capacity = venue.max_players_allowed != null ? `${venue.max_players_allowed} player${venue.max_players_allowed === 1 ? "" : "s"}` : null;
  const minBooking = formatMinBooking(
    venue.slug ? resolveMinBookingMinutes(venue) : venue.min_booking_minutes ?? venue.slot_duration_minutes
  );
  const open24 = isOpen24Hours(venue.opening_hour, venue.closing_hour);
  const cricketGear = hasCricketEquipment(venue.amenities) ? "Yes" : null;
  const water = venue.water_available?.trim() || null;
  const hasStructured = shape || size || capacity || minBooking || open24 || cricketGear || water || venue.map_url;
  if (!hasStructured) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
    open24 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary", children: "Open 24 hours" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
      shape && /* @__PURE__ */ jsxRuntimeExports.jsx(Spec, { label: "Shape", value: shape }),
      size && /* @__PURE__ */ jsxRuntimeExports.jsx(Spec, { label: "Size", value: size }),
      capacity && /* @__PURE__ */ jsxRuntimeExports.jsx(Spec, { label: "Ideal capacity", value: capacity }),
      minBooking && /* @__PURE__ */ jsxRuntimeExports.jsx(Spec, { label: "Min booking time", value: minBooking }),
      cricketGear && /* @__PURE__ */ jsxRuntimeExports.jsx(Spec, { label: "Cricket equipment available", value: cricketGear }),
      water && /* @__PURE__ */ jsxRuntimeExports.jsx(Spec, { label: "Water available", value: water }),
      venue.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-card/50 px-3 py-2.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-muted-foreground", children: "Location" }),
        venue.map_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: venue.map_url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline",
            children: [
              venue.address,
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm font-semibold text-foreground", children: venue.address })
      ] })
    ] })
  ] });
}
function BookingPaymentPortal({
  amount,
  bookingLabel,
  hours,
  venueName,
  disabled,
  loading,
  requiresPayment = true,
  awaitingCheckout = false,
  onPay,
  onOpenCheckout
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-2xl border border-primary/30 bg-gradient-to-b from-[#142219] to-card p-5 shadow-[var(--shadow-glow)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.2em]", children: "Payment portal" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Booking at ",
        venueName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center font-display text-3xl font-bold text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "h-6 w-6" }),
        amount.toLocaleString()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        hours,
        " hour",
        hours === 1 ? "" : "s",
        " · ",
        bookingLabel
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-xl border border-[#1E3A27] bg-[#0B130E]/60 p-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: requiresPayment ? "Pay securely via Razorpay to confirm your slot. Your booking stays reserved until payment completes." : "No payment required. Your booking will be confirmed immediately." })
    ] }),
    awaitingCheckout ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary", children: "Slot reserved. Open Razorpay checkout to complete payment." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "lg",
          className: "glow-primary h-12 w-full",
          disabled: loading,
          onClick: onOpenCheckout,
          children: loading ? "Opening…" : `Open Razorpay · Pay ₹${amount.toLocaleString()}`
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        size: "lg",
        className: "glow-primary h-12 w-full",
        disabled: disabled || loading,
        onClick: onPay,
        children: loading ? "Processing…" : requiresPayment ? `Pay ₹${amount.toLocaleString()} & confirm booking` : "Confirm booking"
      }
    )
  ] });
}
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  amount: numberType().int().min(MIN_ORDER_PAISE),
  currency: stringType().length(3).default("INR"),
  receipt: stringType().min(1).max(40).optional()
}).parse(input)).handler(createSsrRpc("79167d01055e7ca7df54dc70f34b74c07dc814b41e652ca2fabfc1b1237d5d53"));
const verifyBookingPayment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  razorpay_payment_id: stringType().min(1),
  razorpay_order_id: stringType().min(1),
  razorpay_signature: stringType().min(1),
  booking_id: stringType().uuid()
}).parse(input)).handler(createSsrRpc("5607daa85cfa41afc7e3db3fe53bd66008a98f835337c473f35efc1f582bd2ac"));
let scriptPromise = null;
function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}
function useRazorpayCheckout() {
  const verifyFn = useServerFn(verifyBookingPayment);
  const [paying, setPaying] = reactExports.useState(false);
  const openCheckout = reactExports.useCallback(
    async (input) => {
      const keyId = readPublicRazorpayKeyId();
      if (!keyId) {
        toast.error("Payment gateway is not configured");
        return false;
      }
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Could not load Razorpay checkout");
        return false;
      }
      setPaying(true);
      return new Promise((resolve) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount: input.amountPaise,
          currency: input.currency ?? "INR",
          name: input.title,
          description: input.description,
          order_id: input.orderId,
          prefill: {
            name: input.customerName,
            email: input.customerEmail
          },
          theme: { color: "#10b981" },
          handler: async (response) => {
            try {
              await verifyFn({
                data: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  booking_id: input.bookingId
                }
              });
              toast.success("Payment successful. Booking confirmed!");
              resolve(true);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Payment verification failed");
              resolve(false);
            } finally {
              setPaying(false);
            }
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled");
              setPaying(false);
              resolve(false);
            }
          }
        });
        rzp.on("payment.failed", (response) => {
          toast.error(response.error?.description ?? "Payment failed");
          setPaying(false);
          resolve(false);
        });
        rzp.open();
      });
    },
    [verifyFn]
  );
  return { openCheckout, paying };
}
function todayISO() {
  const d = /* @__PURE__ */ new Date();
  return d.toISOString().slice(0, 10);
}
function VenuePage() {
  const {
    slug
  } = Route.useParams();
  const {
    data: rawVenue
  } = useSuspenseQuery(venueQO(slug));
  const venue = rawVenue ? withVenueExtras(rawVenue) : null;
  const {
    user,
    isOwner,
    session
  } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const bookFn = useServerFn(createBooking);
  const {
    openCheckout,
    paying
  } = useRazorpayCheckout();
  const [date, setDate] = reactExports.useState(todayISO());
  const [selected, setSelected] = reactExports.useState([]);
  const [bookingMode, setBookingMode] = reactExports.useState("individual");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [pendingCheckout, setPendingCheckout] = reactExports.useState(null);
  const maxPlayersAllowed = Math.max(1, Number(rawVenue?.max_players_allowed ?? 1));
  const playerCount = bookingMode === "full" ? maxPlayersAllowed : 1;
  const slotsQuery = useQuery({
    queryKey: ["slots", rawVenue?.id, date, playerCount],
    queryFn: () => getSlots({
      data: {
        venueId: rawVenue.id,
        date,
        playerCount
      }
    }),
    enabled: Boolean(rawVenue?.id),
    refetchInterval: 5e3
  });
  if (!venue) return null;
  const open24 = isOpen24Hours(venue.opening_hour, venue.closing_hour);
  const hasStructuredDetails = Boolean(venue.area_sq_ft || venue.map_url || venue.venue_type || venue.water_available);
  const isOwnVenue = Boolean(user && venue.owner_id && user.id === venue.owner_id);
  const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
  const minBookingMinutes = resolveMinBookingMinutes(venue);
  const minSlotCount = Math.max(1, Math.ceil(minBookingMinutes / stepMinutes));
  const sortedSel = [...selected].sort((a, b) => a - b);
  const isContiguous = isContiguousSlots(selected, stepMinutes);
  const total = slotPriceTotal(venue.price_per_hour, selected.length, stepMinutes);
  const selectedDurationMinutes = sortedSel.length ? sortedSel[sortedSel.length - 1] + stepMinutes - sortedSel[0] : 0;
  const selectedHours = bookingDurationHours(selectedDurationMinutes);
  const showBookingModeChoice = maxPlayersAllowed > 1;
  const slotByMinute = new Map((slotsQuery.data ?? []).map((s) => [s.startMinute, s]));
  const minRemainingOnSelection = sortedSel.length ? Math.min(...sortedSel.map((m) => slotByMinute.get(m)?.remaining_capacity ?? maxPlayersAllowed)) : maxPlayersAllowed;
  const alreadyBookedOnSelection = sortedSel.length ? Math.max(...sortedSel.map((m) => slotByMinute.get(m)?.booked_players ?? 0)) : 0;
  const {
    charge: payableAmount,
    perPersonBase,
    isFullTurf
  } = computeBookingCharge(total, maxPlayersAllowed, playerCount);
  const capacityAfterBooking = alreadyBookedOnSelection + playerCount;
  const capacityPercent = Math.round(capacityAfterBooking / maxPlayersAllowed * 100);
  const canBookFullTurf = minRemainingOnSelection >= maxPlayersAllowed;
  const emptySpotsNow = (slotsQuery.data ?? []).reduce((sum, slot) => sum + Math.max(0, Number(slot.remaining_capacity ?? 0)), 0);
  reactExports.useEffect(() => {
    if (bookingMode === "full" && !canBookFullTurf) {
      setBookingMode("individual");
    }
  }, [canBookFullTurf, bookingMode]);
  reactExports.useEffect(() => {
    const availableSet = new Set((slotsQuery.data ?? []).filter((s) => s.available).map((s) => s.startMinute));
    setSelected((prev) => {
      const next = prev.filter((m) => availableSet.has(m));
      return next.length === prev.length ? prev : next;
    });
  }, [slotsQuery.data]);
  async function handleOpenPayment() {
    if (!pendingCheckout || !venue) return;
    const paid = await openCheckout({
      bookingId: pendingCheckout.bookingId,
      orderId: pendingCheckout.orderId,
      amountPaise: pendingCheckout.amountPaise,
      title: "Good Bookies",
      description: `${venue.name} · ${date}`,
      customerName: pendingCheckout.customerName,
      customerEmail: session?.user?.email ?? void 0
    });
    if (paid) {
      const bookingId = pendingCheckout.bookingId;
      setPendingCheckout(null);
      await qc.invalidateQueries({
        queryKey: ["slots", venue.id, date]
      });
      navigate({
        to: "/booking/success",
        search: {
          id: bookingId
        }
      });
    }
  }
  async function handleBook() {
    if (!user) {
      toast.info("Sign in to confirm your booking");
      navigate({
        to: "/login",
        search: {
          redirect: `/venues/${slug}`
        }
      });
      return;
    }
    if (selected.length === 0) return;
    if (!isContiguous) {
      toast.error("Please select consecutive slots only");
      return;
    }
    if (sortedSel.length < minSlotCount) {
      toast.error(`Minimum booking is ${formatMinBookingDuration(minBookingMinutes)}`);
      return;
    }
    if (selectedDurationMinutes < minBookingMinutes) {
      toast.error(`Minimum booking is ${formatMinBookingDuration(minBookingMinutes)}`);
      return;
    }
    if (bookingMode === "full" && !canBookFullTurf) {
      toast.error("Full turf booking requires an empty slot");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookFn({
        data: {
          venueId: venue.id,
          date,
          startMinute: sortedSel[0],
          endMinute: sortedSel[sortedSel.length - 1] + stepMinutes,
          playerCount
        }
      });
      if (res.requiresPayment && res.razorpayOrderId && res.amountPaise >= 100) {
        const customerName = session?.user?.user_metadata?.full_name ?? session?.user?.email?.split("@")[0] ?? "Player";
        setPendingCheckout({
          bookingId: res.bookingId,
          orderId: res.razorpayOrderId,
          amountPaise: res.amountPaise,
          customerName
        });
        await qc.invalidateQueries({
          queryKey: ["slots", venue.id, date]
        });
        toast.message("Slot reserved", {
          description: "Click Open Razorpay below to pay and confirm."
        });
        return;
      }
      await qc.invalidateQueries({
        queryKey: ["slots", venue.id, date]
      });
      navigate({
        to: "/booking/success",
        search: {
          id: res.bookingId
        }
      });
    } catch (e) {
      toast.error(e.message ?? "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: [breadcrumbJsonLd([{
      name: "Home",
      path: "/"
    }, {
      name: "Venues",
      path: "/sports"
    }, {
      name: venue.name,
      path: `/venues/${venue.slug}`
    }]), sportsActivityVenueJsonLd({
      ...venue,
      image_url: resolveMediaUrlAbsolute(venue.image_url)
    })] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.5fr_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 10
      }, animate: {
        opacity: 1,
        y: 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: resolveVenueImage(venue.image_url), alt: venue.name, width: 1280, height: 800, className: "aspect-[16/10] w-full object-cover" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary", children: [
            venue.sport?.icon,
            " ",
            venue.sport?.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 font-display text-4xl font-bold", children: venue.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 shrink-0" }),
              venue.map_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: venue.map_url, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: venue.address }) : venue.address
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }),
              venue.rating != null ? Number(venue.rating).toFixed(1) : "New",
              venue.review_count ? ` (${venue.review_count} reviews)` : ""
            ] }),
            !open24 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
              venue.opening_hour,
              ":00 – ",
              venue.closing_hour,
              ":00"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm font-semibold text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 mr-1 inline h-4 w-4" }),
            venue.price_per_hour.toLocaleString(),
            " per hour"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(VenueDetailSpecs, { venue }),
          !hasStructuredDetails && venue.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: venue.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: venue.amenities?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full border border-border bg-card px-3 py-1 text-xs", children: a }, a)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold", children: "Choose a date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", value: date, min: todayISO(), onChange: (e) => {
            setDate(e.target.value);
            setSelected([]);
          }, className: "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold", children: "Booking type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Book one spot for yourself, or reserve the entire turf. Each player must book their own individual spot — one booking cannot cover multiple players." }),
          showBookingModeChoice ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${bookingMode === "individual" ? "border-primary bg-primary/5" : "border-border/60"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "bookingMode", checked: bookingMode === "individual", onChange: () => setBookingMode("individual"), className: "mt-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Individual spot" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-0.5 block text-muted-foreground", children: [
                  "One spot for you only · includes ",
                  Math.round(INDIVIDUAL_BOOKING_SURCHARGE * 100),
                  "% service fee",
                  selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    " ",
                    "·",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 inline h-3 w-3" }),
                    payableAmount.toLocaleString()
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${bookingMode === "full" ? "border-primary bg-primary/5" : "border-border/60"} ${!canBookFullTurf && sortedSel.length > 0 ? "opacity-60" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "bookingMode", checked: bookingMode === "full", onChange: () => setBookingMode("full"), disabled: sortedSel.length > 0 && !canBookFullTurf, className: "mt-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Full turf" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-0.5 block text-muted-foreground", children: [
                  "Private group booking",
                  selected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    " ",
                    "·",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 inline h-3 w-3" }),
                    total.toLocaleString()
                  ] })
                ] }),
                sortedSel.length > 0 && !canBookFullTurf && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-destructive", children: "Selected slot is not fully empty — choose another slot or book individual spots." })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "This turf holds one player per slot." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-muted-foreground", children: [
            "Turf capacity: ",
            maxPlayersAllowed,
            " player",
            maxPlayersAllowed === 1 ? "" : "s",
            sortedSel.length > 0 && ` · ${minRemainingOnSelection} spot${minRemainingOnSelection === 1 ? "" : "s"} left on selected slot`
          ] }),
          sortedSel.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              alreadyBookedOnSelection,
              " booked + ",
              playerCount,
              " yours = ",
              capacityAfterBooking,
              "/",
              maxPlayersAllowed
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary", style: {
              width: `${capacityPercent}%`
            } }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 font-display text-xl font-semibold", children: "Available slots" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-3 text-xs text-muted-foreground", children: [
            "Live empty spots left today: ",
            emptySpotsNow,
            minSlotCount > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " · Min booking: ",
              formatMinBookingDuration(minBookingMinutes),
              " — select a continuous range"
            ] })
          ] }),
          slotsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground", children: "Loading the pitch…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SlotPicker, { slots: slotsQuery.data ?? [], selected, stepMinutes, minBookingMinutes, onChange: setSelected }, `${date}-${bookingMode}`)
        ] }),
        isOwnVenue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "This is your turf" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            "Partners cannot book their own venue. Manage slots and bookings from",
            " ",
            isOwner ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner", className: "font-medium text-primary hover:underline", children: "Partner dashboard" }) : "Partner dashboard",
            ", or book a different turf as a player."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookingPaymentPortal, { amount: payableAmount, bookingLabel: isFullTurf ? "Full turf" : "Individual spot", hours: selectedHours, venueName: venue.name, disabled: selected.length === 0, loading: submitting || paying, requiresPayment: payableAmount >= 1, awaitingCheckout: Boolean(pendingCheckout), onPay: handleBook, onOpenCheckout: handleOpenPayment }),
          selected.length > 0 && showBookingModeChoice && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "Full turf: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 inline h-3 w-3" }),
            total.toLocaleString(),
            " · Individual base share:",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "mb-0.5 inline h-3 w-3" }),
            perPersonBase.toLocaleString(),
            " + ",
            Math.round(INDIVIDUAL_BOOKING_SURCHARGE * 100),
            "% fee"
          ] }) }),
          selected.length > 0 && !isContiguous && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: "Pick consecutive slots to book a continuous window." }),
          selected.length > 0 && isContiguous && sortedSel.length < minSlotCount && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive", children: [
            "Select at least ",
            formatMinBookingDuration(minBookingMinutes),
            " (",
            minSlotCount,
            " slots)."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(VenueReviews, { venueId: venue.id, venueName: venue.name })
  ] });
}
export {
  VenuePage as component
};
