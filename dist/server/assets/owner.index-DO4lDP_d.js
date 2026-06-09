import { _ as reactExports, Q as jsxRuntimeExports } from "./server-sEOaxYT2.js";
import { u as useQuery } from "./useQuery-k_JvbV2Y.js";
import { u as useServerFn } from "./useServerFn-BqL2-6jX.js";
import { B as ownerSummary, w as ownerRevenueSeries, i as ownerBookingsVolume, q as ownerListBookings } from "./owner.functions-CfTBaShA.js";
import { S as StatusBadge } from "./StatusBadge-BTR6qELD.js";
import { C as CalendarCheck } from "./calendar-check-5T7serao.js";
import { I as IndianRupee } from "./indian-rupee-CR65SlPl.js";
import { B as Building2 } from "./building-2-WsnTZwCI.js";
import { C as Clock } from "./clock-7-v4FpzL.js";
import { C as CircleX } from "./circle-x-C7ORxSST.js";
import { g as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, h as Tooltip, f as Line, B as Bar, R as ResponsiveContainer } from "./LineChart-BmFUOCpZ.js";
import { B as BarChart } from "./BarChart-DR5BPxCj.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-LLKlOzPh.js";
import "./router-ByvzUWBt.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-BlW8ghmW.js";
import "./auth-middleware-CR1k48kq.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
function Kpi({
  icon: Icon,
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-display text-3xl font-bold", children: value })
  ] });
}
function OwnerOverview() {
  const [range, setRange] = reactExports.useState(30);
  const sumFn = useServerFn(ownerSummary);
  const revFn = useServerFn(ownerRevenueSeries);
  const volFn = useServerFn(ownerBookingsVolume);
  const recentFn = useServerFn(ownerListBookings);
  const {
    data: sum
  } = useQuery({
    queryKey: ["owner-sum"],
    queryFn: () => sumFn()
  });
  const {
    data: rev
  } = useQuery({
    queryKey: ["owner-rev", range],
    queryFn: () => revFn({
      data: {
        days: range
      }
    })
  });
  const {
    data: vol
  } = useQuery({
    queryKey: ["owner-vol", range],
    queryFn: () => volFn({
      data: {
        days: range
      }
    })
  });
  const {
    data: recent
  } = useQuery({
    queryKey: ["owner-recent"],
    queryFn: () => recentFn({
      data: {
        status: "all"
      }
    })
  });
  const tip = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Your venues at a glance." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: CalendarCheck, label: "Bookings today", value: sum?.bookingsToday ?? "N/A", accent: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: IndianRupee, label: "Revenue today", value: sum ? `₹${sum.revenueToday.toLocaleString()}` : "N/A", accent: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: IndianRupee, label: "Revenue this month", value: sum ? `₹${sum.revenueMonth.toLocaleString()}` : "N/A" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Building2, label: "Active venues", value: sum?.activeVenues ?? "N/A" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: Clock, label: "Pending bookings", value: sum?.pendingBookings ?? "N/A" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Kpi, { icon: CircleX, label: "Cancellations (mo)", value: sum?.cancelMonth ?? "N/A" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Revenue", range, setRange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: rev ?? [], children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", fontSize: 11, tickFormatter: (d) => d.slice(5), stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { fontSize: 11, stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tip, formatter: (v) => [`₹${v}`, "Revenue"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "var(--primary)", strokeWidth: 2.5, dot: false })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartCard, { title: "Bookings", range, setRange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: vol ?? [], children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", fontSize: 11, tickFormatter: (d) => d.slice(5), stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { fontSize: 11, stroke: "var(--muted-foreground)", allowDecimals: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tip }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: "var(--chart-3)", radius: [4, 4, 0, 0] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Recent bookings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Venue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Slot" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (recent ?? []).slice(0, 8).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: b.profile?.full_name || b.profile?.email || "N/A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: b.venue?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-muted-foreground", children: [
            b.booking_date,
            " · ",
            b.start_hour,
            ":00"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right font-semibold", children: [
            "₹",
            b.total_price
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: b.status }) })
        ] }, b.id)) })
      ] }) })
    ] })
  ] });
}
function ChartCard({
  title,
  range,
  setRange,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 rounded-lg bg-muted p-1 text-xs", children: [7, 30, 90].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setRange(d), className: `rounded-md px-3 py-1 font-medium ${range === d ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`, children: [
        d,
        "d"
      ] }, d)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-56", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children }) })
  ] });
}
export {
  OwnerOverview as component
};
