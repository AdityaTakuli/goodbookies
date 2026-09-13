import { _ as reactExports, Q as jsxRuntimeExports } from "./server-BDxa_Kju.js";
import { u as useQuery } from "./useQuery-Pc9p_Eho.js";
import { ag as useQueryClient, B as Button, ab as toast } from "./router-Dbk61_Mg.js";
import { u as useServerFn } from "./useServerFn-BY9fJtg0.js";
import { h as adminGetSettings, v as adminUpdateSettings } from "./admin.functions-Cr6D-pd1.js";
import { I as Input } from "./input-DyhpZCRG.js";
import { L as Label } from "./label-CiH6_hC7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-D_dntZRf.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-ChthLJ-h.js";
import "./auth-middleware-CXeE-dWU.js";
import "./cancellation-policy-CDWg5dXD.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
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
