import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CJcsSZnB.js";
import { J as listMyBookings, ac as useQueryClient, B as Button, d as Link, a7 as toast } from "./router-C57BC541.js";
import { u as useQuery } from "./useQuery-k-wH7ZTW.js";
import { u as useServerFn } from "./useServerFn-DGp46CEA.js";
import { c as listPendingQueriesForHost, l as listMyLobbyQueries, a as acceptLobbyQuery, d as declineLobbyQuery } from "./lobby.functions-fejnH3iQ.js";
import { c as cancelMyBooking } from "./account.functions-DRGxGwK8.js";
import { b as resolveVenueImage } from "./urls-DXkm7umv.js";
import { S as StatusBadge } from "./StatusBadge-BHl9Afap.js";
import { e as formatBookingStartLabel, f as formatBookingSlotLabel } from "./slot-time-DELf3klw.js";
import { m as motion } from "./proxy-CeFP1N5D.js";
import { M as MapPin } from "./map-pin-CbSaU9r0.js";
import { C as Calendar } from "./calendar-s5Vl5wuR.js";
import { U as Users } from "./users-CqvWk1hR.js";
import { S as Star } from "./star-CreIHa2L.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./auth-middleware-BbcIVBGe.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-w5fmvERx.js";
const queryStatusLabel = {
  pending: "Pending host approval",
  accepted: "Approved, ready to play",
  rejected: "Rejected",
  expired: "Expired / full"
};
function AccountBookings() {
  const listFn = useServerFn(listMyBookings);
  const cancelFn = useServerFn(cancelMyBooking);
  const hostQueriesFn = useServerFn(listPendingQueriesForHost);
  const myQueriesFn = useServerFn(listMyLobbyQueries);
  const acceptFn = useServerFn(acceptLobbyQuery);
  const declineFn = useServerFn(declineLobbyQuery);
  const qc = useQueryClient();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: bookings,
    isLoading
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => listFn()
  });
  const {
    data: hostQueries
  } = useQuery({
    queryKey: ["host-lobby-queries"],
    queryFn: () => hostQueriesFn(),
    refetchInterval: 5e3
  });
  const {
    data: sentQueries
  } = useQuery({
    queryKey: ["my-lobby-queries"],
    queryFn: () => myQueriesFn(),
    refetchInterval: 5e3
  });
  const {
    upcoming,
    past,
    cancelled
  } = reactExports.useMemo(() => {
    const u = [];
    const p = [];
    const c = [];
    (bookings ?? []).forEach((b) => {
      if (b.status === "cancelled") c.push(b);
      else if (b.booking_date >= today) u.push(b);
      else p.push(b);
    });
    return {
      upcoming: u,
      past: p,
      cancelled: c
    };
  }, [bookings, today]);
  const onCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelFn({
        data: {
          id
        }
      });
      toast.success("Booking cancelled");
      qc.invalidateQueries({
        queryKey: ["my-bookings"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  const onAccept = async (queryId) => {
    try {
      await acceptFn({
        data: {
          queryId
        }
      });
      toast.success("Player added to your match");
      qc.invalidateQueries({
        queryKey: ["host-lobby-queries"]
      });
      qc.invalidateQueries({
        queryKey: ["my-bookings"]
      });
      qc.invalidateQueries({
        queryKey: ["open-lobbies"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  const onDecline = async (queryId) => {
    try {
      await declineFn({
        data: {
          queryId
        }
      });
      toast.success("Request declined");
      qc.invalidateQueries({
        queryKey: ["host-lobby-queries"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  const pendingSent = (sentQueries ?? []).filter((q) => q.status === "pending" || q.status === "accepted");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "My bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        bookings?.length ?? 0,
        " total"
      ] })
    ] }),
    (hostQueries?.length ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Join requests on your matches" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-4", children: hostQueries.map((q) => {
        const seeker = q.seeker?.full_name || q.seeker?.email || "A player";
        const names = (q.player_names ?? []).join(", ");
        const b = q.booking;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: seeker }),
            " wants to join your",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatBookingStartLabel(b) }),
            " game on",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: b?.booking_date }),
            " with",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: q.player_count }),
            " player",
            q.player_count === 1 ? "" : "s",
            names ? ` (${names})` : "",
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: b?.venue?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => onAccept(q.id), children: "Accept" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => onDecline(q.id), children: "Reject" })
          ] })
        ] }, q.id);
      }) })
    ] }),
    pendingSent.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Sent join requests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: pendingSent.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border/60 bg-card p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: q.booking?.venue?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            q.booking?.booking_date,
            " · ",
            formatBookingStartLabel(q.booking ?? {
              start_hour: 0
            }),
            " · ",
            q.player_count,
            " players"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-1 text-xs font-medium", children: queryStatusLabel[q.status] ?? q.status })
      ] }) }, q.id)) })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading…" }),
    !isLoading && bookings?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No bookings yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sports", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-4", children: "Book your first slot" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingSection, { title: "Upcoming", items: upcoming, onCancel, rebook: false }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingSection, { title: "Past", items: past, rebook: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BookingSection, { title: "Cancelled", items: cancelled })
  ] });
}
function BookingSection({
  title,
  items,
  onCancel,
  rebook
}) {
  if (!items?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-4", children: items.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.04
    }, className: "flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: resolveVenueImage(b.venue?.image_url), alt: "", loading: "lazy", className: "h-24 w-full rounded-lg object-cover sm:w-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b.venue?.sport?.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: b.venue?.name }),
          b.is_open_lobby && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary", children: "Open lobby" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
            b.venue?.city
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
            b.booking_date,
            " · ",
            formatBookingSlotLabel(b)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
            b.player_count,
            " players"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-display text-xl font-bold text-primary", children: [
          "₹",
          b.total_price
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: b.status }),
        onCancel && b.status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => onCancel(b.id), children: "Cancel" }),
        rebook && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/venues/$slug", params: {
            slug: b.venue?.slug
          }, hash: "reviews", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5" }),
            "Review turf"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/venues/$slug", params: {
            slug: b.venue?.slug
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", children: "Re-book" }) })
        ] })
      ] })
    ] }, b.id)) })
  ] });
}
export {
  AccountBookings as component
};
