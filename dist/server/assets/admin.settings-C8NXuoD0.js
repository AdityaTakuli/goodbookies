import { _ as reactExports, Q as jsxRuntimeExports } from "./server-kUsPFTeq.js";
import { u as useQuery } from "./useQuery-MlFYurGg.js";
import { ac as useQueryClient, B as Button, a7 as toast } from "./router-BoA3wDIv.js";
import { u as useServerFn } from "./useServerFn-gTetisiI.js";
import { h as adminGetSettings, v as adminUpdateSettings } from "./admin.functions-CiyE3Tqg.js";
import { I as Input } from "./input-B1CQn0-y.js";
import { L as Label } from "./label-sS4meqY4.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-CWX68g6j.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./urls-CW7Hd3Bj.js";
import "./auth-middleware-DPQHMA7I.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-DJaPhCuO.js";
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
  label: "Legacy cancellation hours (unused — tiered policy: 3h / 2h)"
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
