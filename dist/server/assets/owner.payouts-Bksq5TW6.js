import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CW70W96A.js";
import { u as useQuery } from "./useQuery-XFn0BJAY.js";
import { a3 as useQueryClient, B as Button, _ as toast } from "./router-DtNFzvhh.js";
import { u as useServerFn } from "./useServerFn-CZeUAURU.js";
import { n as ownerGetPayouts, z as ownerSavePayoutDetails } from "./owner.functions-DaK38570.js";
import { I as Input } from "./input-Bvc3IHJ0.js";
import { L as Label } from "./label-CwZBxbtK.js";
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
function OwnerPayouts() {
  const getFn = useServerFn(ownerGetPayouts);
  const saveFn = useServerFn(ownerSavePayoutDetails);
  const qc = useQueryClient();
  const {
    data
  } = useQuery({
    queryKey: ["owner-payouts"],
    queryFn: () => getFn()
  });
  const [bank, setBank] = reactExports.useState({
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    bank_name: ""
  });
  const saveBank = async () => {
    try {
      await saveFn({
        data: bank
      });
      toast.success("Bank details saved");
      qc.invalidateQueries({
        queryKey: ["owner-payouts"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Payouts" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Platform commission: ",
      data?.commissionRate ?? 10,
      "% · Payouts processed manually by admin."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [{
      label: "Lifetime earned",
      value: data?.lifetimeEarned
    }, {
      label: "Commission",
      value: data?.commissionDeducted
    }, {
      label: "Net earned",
      value: data?.netEarned,
      accent: true
    }, {
      label: "Pending payout",
      value: data?.pendingPayout
    }].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase text-muted-foreground", children: c.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `mt-2 font-display text-2xl font-bold ${c.accent ? "text-primary" : ""}`, children: [
        "₹",
        (c.value ?? 0).toLocaleString()
      ] })
    ] }, c.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Bank details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account holder" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bank.account_holder_name || data?.bank?.account_holder_name || "", onChange: (e) => setBank({
              ...bank,
              account_holder_name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Account number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bank.account_number || data?.bank?.account_number || "", onChange: (e) => setBank({
              ...bank,
              account_number: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "IFSC" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bank.ifsc_code || data?.bank?.ifsc_code || "", onChange: (e) => setBank({
              ...bank,
              ifsc_code: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bank name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: bank.bank_name || data?.bank?.bank_name || "", onChange: (e) => setBank({
              ...bank,
              bank_name: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveBank, children: "Save bank details" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-3", children: "Payout history" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          (data?.payouts ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No payouts yet." }),
          (data?.payouts ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-border/40 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              p.created_at?.slice(0, 10),
              " · ",
              p.status
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
              "₹",
              p.net_amount
            ] })
          ] }, p.id))
        ] })
      ] })
    ] })
  ] });
}
export {
  OwnerPayouts as component
};
