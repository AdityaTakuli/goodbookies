import { _ as reactExports, Q as jsxRuntimeExports } from "./server-Bri4PIdt.js";
import { u as useQuery } from "./useQuery-B06bzE1o.js";
import { a0 as useQueryClient, B as Button, W as toast } from "./router-B_AVMN9I.js";
import { u as useServerFn } from "./useServerFn-DSJvdnK5.js";
import { b as adminListOwners, f as adminUpdateOwner } from "./owner.functions-Cl95ya45.js";
import { I as Input } from "./input-B_ya02Ov.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-97AORvch.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-UXLcuu7j.js";
import "./auth-middleware-B5jQ50rh.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
function AdminOwners() {
  const listFn = useServerFn(adminListOwners);
  const updateFn = useServerFn(adminUpdateOwner);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-owners"],
    queryFn: () => listFn()
  });
  const [commissionEdit, setCommissionEdit] = reactExports.useState({});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Owners" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 overflow-x-auto", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "City" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Venues" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2", children: "Commission %" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (data ?? []).map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 font-medium", children: o.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: o.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: o.city }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: o.venueCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 capitalize", children: o.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "w-20 h-8", placeholder: o.platform_commission_override ?? "default", value: commissionEdit[o.id] ?? "", onChange: (e) => setCommissionEdit({
            ...commissionEdit,
            [o.id]: e.target.value
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right space-x-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: async () => {
              const v = commissionEdit[o.id];
              await updateFn({
                data: {
                  id: o.id,
                  platform_commission_override: v ? Number(v) : null
                }
              });
              toast.success("Commission updated");
              qc.invalidateQueries({
                queryKey: ["admin-owners"]
              });
            }, children: "Set %" }),
            o.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: async () => {
              await updateFn({
                data: {
                  id: o.id,
                  status: "suspended"
                }
              });
              toast.success("Suspended");
              qc.invalidateQueries({
                queryKey: ["admin-owners"]
              });
            }, children: "Suspend" }),
            o.status === "suspended" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: async () => {
              await updateFn({
                data: {
                  id: o.id,
                  status: "approved"
                }
              });
              toast.success("Reactivated");
              qc.invalidateQueries({
                queryKey: ["admin-owners"]
              });
            }, children: "Unsuspend" })
          ] })
        ] }, o.id)) })
      ] })
    ] })
  ] });
}
export {
  AdminOwners as component
};
