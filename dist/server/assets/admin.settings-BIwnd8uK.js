import { Z as reactExports, P as jsxRuntimeExports } from "./server-BPDym7TD.js";
import { u as useQuery } from "./useQuery-D6nzSS0s.js";
import { W as useQueryClient, B as Button, P as toast } from "./router-DPAh7O8H.js";
import { u as useServerFn } from "./useServerFn-qYvsDpxB.js";
import { h as adminGetSettings, v as adminUpdateSettings } from "./admin.functions-DtM7lzKQ.js";
import { I as Input } from "./input-y3PtWy5G.js";
import { L as Label } from "./label-BlqkEZ_y.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-yDgxkYWd.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-DZDIrDep.js";
import "./player-sports-D0yo17RI.js";
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
