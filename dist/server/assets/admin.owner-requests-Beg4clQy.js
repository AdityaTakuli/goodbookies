import { Q as jsxRuntimeExports } from "./server-CW70W96A.js";
import { u as useQuery } from "./useQuery-XFn0BJAY.js";
import { a3 as useQueryClient, B as Button, _ as toast } from "./router-DtNFzvhh.js";
import { u as useServerFn } from "./useServerFn-CZeUAURU.js";
import { a as adminListOwnerRequests, d as adminReviewOwnerRequest } from "./owner.functions-DaK38570.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-BeoeoLlA.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-CYv4x4Wv.js";
import "./auth-middleware-3Vh87wGa.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-DJaPhCuO.js";
function AdminOwnerRequests() {
  const listFn = useServerFn(adminListOwnerRequests);
  const reviewFn = useServerFn(adminReviewOwnerRequest);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-owner-req"],
    queryFn: () => listFn()
  });
  const review = async (id, action) => {
    let reason;
    if (action === "reject") {
      reason = prompt("Rejection reason:") ?? "Not approved";
      if (!reason) return;
    }
    try {
      await reviewFn({
        data: {
          id,
          action,
          reason
        }
      });
      toast.success(action === "approve" ? "Owner approved" : "Owner rejected");
      qc.invalidateQueries({
        queryKey: ["admin-owner-req"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Owner requests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Pending venue partner applications." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Business" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "City" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Submitted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          (data ?? []).map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 font-medium", children: o.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: o.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: o.phone }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: o.business_name || "N/A" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: o.city }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: o.created_at?.slice(0, 10) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => review(o.id, "approve"), children: "Approve" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => review(o.id, "reject"), children: "Reject" })
            ] })
          ] }, o.id)),
          !isLoading && (data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, className: "py-6 text-center text-sm text-muted-foreground", children: "No pending requests." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AdminOwnerRequests as component
};
