import { _ as reactExports, Q as jsxRuntimeExports } from "./server-C1SlovkB.js";
import { u as useQuery } from "./useQuery-CX216jFu.js";
import { _ as useQueryClient, B as Button, U as toast } from "./router-Dx7LtDHP.js";
import { u as useServerFn } from "./useServerFn-ChSn65jp.js";
import { h as adminGetSettings, v as adminUpdateSettings } from "./admin.functions-B9bdH3oQ.js";
import { I as Input } from "./input-BLVciLwu.js";
import { L as Label } from "./label-DAgH9NPC.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-BAJP6Nx0.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./urls-l-aaheEG.js";
import "./auth-middleware-B3M4xANW.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
const FIELDS = [{
  key: "site_name",
  label: "Site name"
}, {
  key: "contact_email",
  label: "Contact email"
}, {
  key: "support_phone",
  label: "Support phone"
}, {
  key: "peak_hour_surcharge_percent",
  label: "Peak hour surcharge (%)"
}, {
  key: "cancellation_hours",
  label: "Cancellation window (hours before slot)"
}, {
  key: "platform_commission_rate",
  label: "Platform commission (%)"
}];
function AdminSettings() {
  const getFn = useServerFn(adminGetSettings);
  const saveFn = useServerFn(adminUpdateSettings);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getFn()
  });
  const [values, setValues] = reactExports.useState({});
  reactExports.useEffect(() => {
    if (data) setValues(data);
  }, [data]);
  const onSave = async () => {
    try {
      await saveFn({
        data: values
      });
      toast.success("Settings saved");
      qc.invalidateQueries({
        queryKey: ["admin-settings"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Platform configuration." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-6", children: [
      FIELDS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: f.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: values[f.key] ?? "", onChange: (e) => setValues((v) => ({
          ...v,
          [f.key]: e.target.value
        })) })
      ] }, f.key)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSave, children: "Save settings" })
    ] })
  ] });
}
export {
  AdminSettings as component
};
