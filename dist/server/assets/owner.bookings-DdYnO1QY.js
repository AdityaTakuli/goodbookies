import { _ as reactExports, Q as jsxRuntimeExports } from "./server-Cz7outt5.js";
import { f as formatBookingSlotLabel } from "./slot-time-B-rvYjC-.js";
import { u as useQuery } from "./useQuery-Cq7su9C6.js";
import { a3 as useQueryClient, B as Button, _ as toast } from "./router-BGRAZzL_.js";
import { u as useServerFn } from "./useServerFn-BV3limxs.js";
import { q as ownerListBookings, j as ownerConfirmBooking, v as ownerRejectBooking } from "./owner.functions-UUdzBqY1.js";
import { S as StatusBadge } from "./StatusBadge-Cf6TYjKT.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-D_FJ0kB-.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-BOD6FZ-M.js";
import "./auth-middleware-DNN0xV3Z.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-DJaPhCuO.js";
function OwnerBookings() {
  const [status, setStatus] = reactExports.useState("all");
  const listFn = useServerFn(ownerListBookings);
  const confirmFn = useServerFn(ownerConfirmBooking);
  const rejectFn = useServerFn(ownerRejectBooking);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["owner-bookings", status],
    queryFn: () => listFn({
      data: {
        status
      }
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Bookings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 rounded-lg bg-muted p-1 text-xs w-fit", children: ["all", "pending", "confirmed", "cancelled"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatus(s), className: `rounded-md px-3 py-1.5 capitalize font-medium ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`, children: s }, s)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 overflow-x-auto", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Venue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Slot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (data ?? []).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: b.profile?.full_name || b.profile?.phone || "N/A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: b.venue?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-muted-foreground", children: [
            b.booking_date,
            " · ",
            formatBookingSlotLabel(b)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right font-semibold", children: [
            "₹",
            b.total_price
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: b.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right space-x-1", children: b.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: async () => {
              await confirmFn({
                data: {
                  id: b.id
                }
              });
              toast.success("Confirmed");
              qc.invalidateQueries({
                queryKey: ["owner-bookings"]
              });
            }, children: "Confirm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: async () => {
              await rejectFn({
                data: {
                  id: b.id
                }
              });
              toast.success("Rejected");
              qc.invalidateQueries({
                queryKey: ["owner-bookings"]
              });
            }, children: "Reject" })
          ] }) })
        ] }, b.id)) })
      ] })
    ] })
  ] });
}
export {
  OwnerBookings as component
};
