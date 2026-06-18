import { Q as jsxRuntimeExports } from "./server-CJcsSZnB.js";
import { u as useQuery } from "./useQuery-k-wH7ZTW.js";
import { ac as useQueryClient, B as Button, a7 as toast } from "./router-C57BC541.js";
import { u as useServerFn } from "./useServerFn-DGp46CEA.js";
import { c as adminListVenueApprovals, e as adminReviewVenue } from "./owner.functions-Dpg4XGbZ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-w5fmvERx.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./urls-DXkm7umv.js";
import "./auth-middleware-BbcIVBGe.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-DJaPhCuO.js";
function AdminVenueApprovals() {
  const listFn = useServerFn(adminListVenueApprovals);
  const reviewFn = useServerFn(adminReviewVenue);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-venue-approvals"],
    queryFn: () => listFn()
  });
  const review = async (id, action) => {
    let reason;
    if (action === "reject") reason = prompt("Rejection reason:") ?? void 0;
    try {
      await reviewFn({
        data: {
          id,
          action,
          reason
        }
      });
      toast.success(action === "approve" ? "Venue live" : "Venue rejected");
      qc.invalidateQueries({
        queryKey: ["admin-venue-approvals"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Venue approvals" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        (data ?? []).map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between gap-3 border-b border-border/40 pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: v.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              v.sport?.name,
              " · ",
              v.city,
              " · ₹",
              v.price_per_hour,
              "/hr"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Owner: ",
              v.owner?.name,
              " (",
              v.owner?.email,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => review(v.id, "approve"), children: "Approve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => review(v.id, "reject"), children: "Reject" })
          ] })
        ] }, v.id)),
        !isLoading && (data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No pending venues." })
      ] })
    ] })
  ] });
}
export {
  AdminVenueApprovals as component
};
