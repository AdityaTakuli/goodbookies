import { _ as reactExports, Q as jsxRuntimeExports } from "./server-Dz5ce8OK.js";
import { u as useQuery } from "./useQuery-CRNhu890.js";
import { ac as useQueryClient, B as Button, a7 as toast } from "./router-BDNr6ult.js";
import { u as useServerFn } from "./useServerFn-BsCdovFp.js";
import { g as getOwnerStatus, D as ownerUpdateProfile } from "./owner.functions-BGbJZeeN.js";
import { I as Input } from "./input-l8do17Kt.js";
import { L as Label } from "./label-Co9BpwK1.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-DqcC_v-l.js";
import "./client-mpeOq5KX.js";
import "./index-BlRNeFf7.js";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./urls-DQ8wDDis.js";
import "./auth-middleware-C91PqdJt.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-DJaPhCuO.js";
function OwnerSettings() {
  const getFn = useServerFn(getOwnerStatus);
  const saveFn = useServerFn(ownerUpdateProfile);
  const qc = useQueryClient();
  const {
    data: owner
  } = useQuery({
    queryKey: ["owner-status"],
    queryFn: () => getFn()
  });
  const [form, setForm] = reactExports.useState({
    name: "",
    phone: "",
    business_name: ""
  });
  reactExports.useEffect(() => {
    if (owner) setForm({
      name: owner.name ?? "",
      phone: owner.phone ?? "",
      business_name: owner.business_name ?? ""
    });
  }, [owner]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Settings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: owner?.email ?? "", disabled: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({
          ...form,
          name: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.phone, onChange: (e) => setForm({
          ...form,
          phone: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Business name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.business_name, onChange: (e) => setForm({
          ...form,
          business_name: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: async () => {
        try {
          await saveFn({
            data: form
          });
          toast.success("Profile updated");
          qc.invalidateQueries({
            queryKey: ["owner-status"]
          });
        } catch (e) {
          toast.error(e.message);
        }
      }, children: "Save" })
    ] })
  ] });
}
export {
  OwnerSettings as component
};
