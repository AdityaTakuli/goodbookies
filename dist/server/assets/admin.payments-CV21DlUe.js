import { _ as reactExports, Q as jsxRuntimeExports } from "./server-BgZyuTnf.js";
import { u as useQuery } from "./useQuery-BofKNAfe.js";
import { u as useServerFn } from "./useServerFn-BRhfjwkH.js";
import { j as adminListPayments, p as adminPaymentsSummary } from "./admin.functions-BWTSvkB9.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-DAbCapwX.js";
import "./router-DQR6OBmb.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-B7CorGA4.js";
import "./auth-middleware-D6nPneOb.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-DJaPhCuO.js";
function AdminPayments() {
  const [status, setStatus] = reactExports.useState("all");
  const listFn = useServerFn(adminListPayments);
  const sumFn = useServerFn(adminPaymentsSummary);
  const {
    data: summary
  } = useQuery({
    queryKey: ["admin-pay-sum"],
    queryFn: () => sumFn()
  });
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-payments", status],
    queryFn: () => listFn({
      data: {
        status
      }
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Payments & revenue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Transaction ledger (from bookings)." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: [{
      label: "Collected (month)",
      value: summary?.collected
    }, {
      label: "Refunded (month)",
      value: summary?.refunded
    }, {
      label: "Net revenue",
      value: summary?.net,
      accent: true
    }].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: c.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-2 font-display text-2xl font-bold ${c.accent ? "text-primary" : ""}`, children: c.value != null ? `₹${c.value.toLocaleString()}` : "N/A" })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 rounded-lg bg-muted p-1 text-xs w-fit", children: ["all", "success", "cancelled", "pending"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatus(s), className: `rounded-md px-3 py-1.5 font-medium capitalize transition-colors ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`, children: s }, s)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Venue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Date" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (data ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 font-mono text-xs", children: p.id.slice(0, 8) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: p.user }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: p.venue }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right font-semibold text-primary", children: [
            "₹",
            p.amount
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: p.method }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 capitalize", children: p.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: p.date?.slice(0, 10) })
        ] }, p.id)) })
      ] }) })
    ] })
  ] });
}
export {
  AdminPayments as component
};
