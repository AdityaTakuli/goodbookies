import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CkN7nAyv.js";
import { u as useQuery } from "./useQuery-D2b8YGVU.js";
import { W as useQueryClient, B as Button, P as toast } from "./router-NTbsnVdt.js";
import { u as useServerFn } from "./useServerFn-BozvyFCm.js";
import { i as adminListBookings, d as adminCancelBooking } from "./admin.functions-Dwp6gSJV.js";
import { f as formatBookingPlayerNames, b as bookingPlayerCount } from "./booking-display-BVPu9KGs.js";
import { S as StatusBadge } from "./StatusBadge-B7v1Urvk.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-DKknSazh.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-BTPNIYzE.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
function AdminBookings() {
  const [status, setStatus] = reactExports.useState("all");
  const listFn = useServerFn(adminListBookings);
  const cancelFn = useServerFn(adminCancelBooking);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-bookings", status],
    queryFn: () => listFn({
      data: {
        limit: 100,
        status
      }
    })
  });
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
        queryKey: ["admin-bookings"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          data?.length ?? 0,
          " results"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 rounded-lg bg-muted p-1 text-xs", children: ["all", "confirmed", "cancelled", "pending"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatus(s), className: `rounded-md px-3 py-1.5 font-medium capitalize transition-colors ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: s }, s)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Booked by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Players" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Venue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Sport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Slot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          (data ?? []).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 font-mono text-xs text-muted-foreground", children: b.id.slice(0, 8) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: b.profile?.full_name || b.profile?.email || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: formatBookingPlayerNames(b) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                bookingPlayerCount(b),
                " player",
                bookingPlayerCount(b) === 1 ? "" : "s"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: b.venue?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: b.venue?.sport?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-muted-foreground", children: [
              b.booking_date,
              " · ",
              b.start_hour,
              ":00–",
              b.end_hour,
              ":00"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right font-semibold", children: [
              "₹",
              b.total_price
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: b.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: b.status === "confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => onCancel(b.id), children: "Cancel" }) })
          ] }, b.id)),
          !isLoading && (data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, className: "py-6 text-center text-sm text-muted-foreground", children: "No bookings." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AdminBookings as component
};
