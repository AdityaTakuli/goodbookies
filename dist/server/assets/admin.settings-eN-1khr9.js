import { _ as reactExports, Q as jsxRuntimeExports } from "./server-BtUn1Hgv.js";
import { u as useQuery } from "./useQuery-BJoJ4O3E.js";
import { a3 as useQueryClient, B as Button, _ as toast } from "./router-p2oW4M6C.js";
import { u as useServerFn } from "./useServerFn-B90c2W5C.js";
import { h as adminGetSettings, v as adminUpdateSettings } from "./admin.functions-D2nggSbH.js";
import { I as Input } from "./input-Dg5TW3Rc.js";
import { L as Label } from "./label-CCGd4mD3.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-GpLJRM0q.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-CDalmZy3.js";
import "./auth-middleware-CO-X9AGf.js";
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
