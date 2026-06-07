import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CkN7nAyv.js";
import { u as useQuery } from "./useQuery-D2b8YGVU.js";
import { W as useQueryClient, B as Button, P as toast } from "./router-NTbsnVdt.js";
import { u as useServerFn } from "./useServerFn-BozvyFCm.js";
import { t as ownerListVenues, s as ownerListSlots, h as ownerBlockSlot, C as ownerUnblockSlot } from "./owner.functions-Dkg2DlIp.js";
import { I as Input } from "./input-CzUceto8.js";
import { L as Label } from "./label-Kvna-DLw.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-DKknSazh.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-BTPNIYzE.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
function OwnerSlots() {
  const venuesFn = useServerFn(ownerListVenues);
  const slotsFn = useServerFn(ownerListSlots);
  const blockFn = useServerFn(ownerBlockSlot);
  const unblockFn = useServerFn(ownerUnblockSlot);
  const qc = useQueryClient();
  const month = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const [venueId, setVenueId] = reactExports.useState("");
  const [selectedDate, setSelectedDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [blockStart, setBlockStart] = reactExports.useState("18:00");
  const [blockEnd, setBlockEnd] = reactExports.useState("20:00");
  const {
    data: venues
  } = useQuery({
    queryKey: ["owner-venues"],
    queryFn: () => venuesFn()
  });
  const activeVenue = venueId || venues?.[0]?.id || "";
  const {
    data: slotData
  } = useQuery({
    queryKey: ["owner-slots", activeVenue, month],
    queryFn: () => slotsFn({
      data: {
        venueId: activeVenue,
        month
      }
    }),
    enabled: !!activeVenue
  });
  const dayBookings = (slotData?.bookings ?? []).filter((b) => b.booking_date === selectedDate);
  const dayBlocks = (slotData?.blocks ?? []).filter((b) => !b.block_date || b.block_date === selectedDate || b.is_recurring);
  const onBlock = async () => {
    try {
      await blockFn({
        data: {
          venueId: activeVenue,
          date: selectedDate,
          startTime: blockStart,
          endTime: blockEnd,
          reason: "Owner block"
        }
      });
      toast.success("Slot blocked");
      qc.invalidateQueries({
        queryKey: ["owner-slots"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Slot management" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Venue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "mt-1 h-10 rounded-md border border-input bg-input px-3 text-sm", value: activeVenue, onChange: (e) => setVenueId(e.target.value), children: (venues ?? []).map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: v.id, children: v.name }, v.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Day schedule" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: Array.from({
          length: 16
        }, (_, i) => i + 6).map((h) => {
          const booked = dayBookings.some((b) => h >= b.start_hour && h < b.end_hour && b.status !== "cancelled");
          const blocked = dayBlocks.some((bl) => {
            const sh = Number(String(bl.start_time).slice(0, 2));
            const eh = Number(String(bl.end_time).slice(0, 2));
            return h >= sh && h < eh;
          });
          const cls = booked ? "bg-destructive/20 text-destructive" : blocked ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `rounded-lg px-3 py-2 text-sm font-medium ${cls}`, children: [
            h,
            ":00"
          ] }, h);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Green = available · Red = booked · Grey = blocked" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Block time range" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "From" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: blockStart, onChange: (e) => setBlockStart(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "To" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: blockEnd, onChange: (e) => setBlockEnd(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onBlock, children: "Block slots" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase text-muted-foreground mb-2", children: "Active blocks" }),
          (slotData?.blocks ?? []).map((bl) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              bl.block_date ?? `Day ${bl.recurrence_day}`,
              " · ",
              String(bl.start_time).slice(0, 5),
              "–",
              String(bl.end_time).slice(0, 5)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: async () => {
              await unblockFn({
                data: {
                  id: bl.id,
                  venueId: activeVenue
                }
              });
              qc.invalidateQueries({
                queryKey: ["owner-slots"]
              });
            }, children: "Remove" })
          ] }, bl.id))
        ] })
      ] })
    ] })
  ] });
}
export {
  OwnerSlots as component
};
