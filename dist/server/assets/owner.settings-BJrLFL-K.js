import { Z as reactExports, P as jsxRuntimeExports } from "./server-DZ-HHBSO.js";
import { u as useQuery } from "./useQuery-DHLOOWr5.js";
import { W as useQueryClient, B as Button, P as toast } from "./router-Hx5xDr3C.js";
import { u as useServerFn } from "./useServerFn-vlAfTLJk.js";
import { g as getOwnerStatus, D as ownerUpdateProfile } from "./owner.functions-CGz-6ehH.js";
import { I as Input } from "./input-fMTv4SO3.js";
import { L as Label } from "./label-CacOriZ2.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-Dli0nawq.js";
import "./client-BIT182qO.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-Dlzf4XC9.js";
import "./player-sports-D0yo17RI.js";
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
