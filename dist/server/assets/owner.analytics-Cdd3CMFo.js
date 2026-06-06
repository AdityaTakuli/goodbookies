import { P as jsxRuntimeExports } from "./server-DZ-HHBSO.js";
import { u as useQuery } from "./useQuery-DHLOOWr5.js";
import { u as useServerFn } from "./useServerFn-vlAfTLJk.js";
import { w as ownerRevenueSeries, u as ownerPeakHours, m as ownerExportAnalyticsCsv } from "./owner.functions-CGz-6ehH.js";
import { B as Button } from "./router-Hx5xDr3C.js";
import { R as ResponsiveContainer, g as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, h as Tooltip, f as Line } from "./LineChart-Bb_221Kg.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-Dli0nawq.js";
import "./auth-middleware-Dlzf4XC9.js";
import "./index-BlRNeFf7.js";
import "./client-BIT182qO.js";
import "./player-sports-D0yo17RI.js";
function OwnerAnalytics() {
  const revFn = useServerFn(ownerRevenueSeries);
  const peakFn = useServerFn(ownerPeakHours);
  const exportFn = useServerFn(ownerExportAnalyticsCsv);
  const {
    data: rev
  } = useQuery({
    queryKey: ["owner-an-rev"],
    queryFn: () => revFn({
      data: {
        days: 90
      }
    })
  });
  const {
    data: peak
  } = useQuery({
    queryKey: ["owner-peak"],
    queryFn: () => peakFn()
  });
  const maxCount = Math.max(1, ...(peak ?? []).map((p) => p.count));
  const tip = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8
  };
  const downloadCsv = async () => {
    const {
      csv,
      filename
    } = await exportFn();
    const blob = new Blob([csv], {
      type: "text/csv"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Analytics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: downloadCsv, children: "Export CSV" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Revenue (90 days)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: rev ?? [], children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", fontSize: 10, tickFormatter: (d) => d.slice(5), stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { fontSize: 11, stroke: "var(--muted-foreground)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: tip, formatter: (v) => [`₹${v}`, "Revenue"] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "revenue", stroke: "var(--primary)", strokeWidth: 2, dot: false })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold mb-4", children: "Peak hours heatmap" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-grid gap-0.5", style: {
        gridTemplateColumns: `repeat(8, minmax(28px, 1fr))`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-[10px] text-muted-foreground py-1", children: d }, d)),
        [6, 8, 10, 12, 14, 16, 18, 20].flatMap((hour) => [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground pr-1 flex items-center", children: [
          hour,
          ":00"
        ] }, `h-${hour}`), ...[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const cell = peak?.find((p) => p.day === day && p.hour === hour);
          const intensity = (cell?.count ?? 0) / maxCount;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-7 rounded-sm", style: {
            background: `oklch(${0.35 + intensity * 0.35} 0.12 145)`
          }, title: `${cell?.count ?? 0} bookings` }, `${day}-${hour}`);
        })])
      ] }) })
    ] })
  ] });
}
export {
  OwnerAnalytics as component
};
