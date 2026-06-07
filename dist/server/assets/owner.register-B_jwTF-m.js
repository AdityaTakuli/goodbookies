import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CJ_fNbT3.js";
import { L as Link, B as Button, P as toast } from "./router-CfsmQHaQ.js";
import { u as useServerFn } from "./useServerFn-DJDBluv0.js";
import { G as registerOwner } from "./owner.functions-DmfIEMXp.js";
import { I as Input } from "./input-U-LR5kZQ.js";
import { L as Label } from "./label-BuYw2Y6S.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-DWpfsGMM.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
function OwnerRegister() {
  const registerFn = useServerFn(registerOwner);
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    business_name: "",
    city: "",
    agreed: false
  });
  const [done, setDone] = reactExports.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (!form.agreed) {
      toast.error("Please accept the terms");
      return;
    }
    try {
      const res = await registerFn({
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          business_name: form.business_name || void 0,
          city: form.city
        }
      });
      toast.success(res.message);
      setDone(true);
    } catch (err) {
      toast.error(err.message);
    }
  };
  if (done) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-md px-4 py-24 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Partner account created" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Your partner account is approved instantly. Continue to owner login." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/login", className: "mt-6 inline-block text-sm text-primary hover:underline", children: "Go to owner login →" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-lg px-4 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold", children: "List your venue" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Use the same Gmail as your player account — we'll link partner access. You can book other turfs as a player, but not your own." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.name, onChange: (e) => setForm({
        ...form,
        name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", required: true, value: form.email, onChange: (e) => setForm({
        ...form,
        email: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.phone, onChange: (e) => setForm({
        ...form,
        phone: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Business name (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.business_name, onChange: (e) => setForm({
        ...form,
        business_name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.city, onChange: (e) => setForm({
        ...form,
        city: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", required: true, minLength: 8, value: form.password, onChange: (e) => setForm({
        ...form,
        password: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm password", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", required: true, value: form.confirm, onChange: (e) => setForm({
        ...form,
        confirm: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "h-4 w-4 accent-primary", checked: form.agreed, onChange: (e) => setForm({
          ...form,
          agreed: e.target.checked
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "I agree to the Terms & Conditions" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Create partner account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
        "Already have an account? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/login", className: "text-primary hover:underline", children: "Owner login" })
      ] })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
    children
  ] });
}
export {
  OwnerRegister as component
};
