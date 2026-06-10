import { Q as jsxRuntimeExports } from "./server-Cz7outt5.js";
import { u as useQuery } from "./useQuery-Cq7su9C6.js";
import { u as useServerFn } from "./useServerFn-BV3limxs.js";
import { a as listMyPayments } from "./account.functions-Ijf2BGZo.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-D_FJ0kB-.js";
import "./router-BGRAZzL_.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-BOD6FZ-M.js";
import "./auth-middleware-DNN0xV3Z.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
function AccountPayments() {
  const listFn = useServerFn(listMyPayments);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => listFn()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Payment history" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "All charges for your bookings." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Booking" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Venue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Sport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          (data ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 font-mono text-xs text-muted-foreground", children: p.booking_id.slice(0, 8) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: p.venue }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: p.sport }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: p.date }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right font-semibold", children: [
              "₹",
              p.amount
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "success" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`, children: p.status }) })
          ] }, p.booking_id)),
          !isLoading && (data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "py-6 text-center text-sm text-muted-foreground", children: "No payments yet." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AccountPayments as component
};
