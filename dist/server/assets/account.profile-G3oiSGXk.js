import { Z as reactExports, P as jsxRuntimeExports } from "./server-DhNrKN56.js";
import { W as useQueryClient, B as Button, L as Link, P as toast } from "./router-RE29p4R8.js";
import { u as useQuery } from "./useQuery-fAuGHRPz.js";
import { u as useServerFn } from "./useServerFn-Djo7pmAm.js";
import { g as getMyProfile, u as updateMyProfile } from "./account.functions-6mJFRvlN.js";
import { I as Input } from "./input-iFfsg3E6.js";
import { L as Label } from "./label-B_6UOW8u.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-4vxQ7zzM.js";
import "./player-sports-D0yo17RI.js";
import "./useBaseQuery-BlN2ThZs.js";
function AccountProfile() {
  const getFn = useServerFn(getMyProfile);
  const saveFn = useServerFn(updateMyProfile);
  const qc = useQueryClient();
  const {
    data: profile,
    isLoading
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getFn()
  });
  const [fullName, setFullName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);
  const onSave = async () => {
    try {
      await saveFn({
        data: {
          full_name: fullName,
          phone
        }
      });
      toast.success("Profile updated");
      qc.invalidateQueries({
        queryKey: ["my-profile"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Update your account details." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: profile?.email ?? "", disabled: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSave, children: "Save changes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Want a shareable player page?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/account/card", className: "font-medium text-primary hover:underline", children: "Open My Player Card →" })
      ] })
    ] })
  ] });
}
export {
  AccountProfile as component
};
