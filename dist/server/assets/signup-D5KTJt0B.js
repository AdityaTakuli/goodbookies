import { Z as reactExports, P as jsxRuntimeExports } from "./server-Dh4Ut09D.js";
import { V as useNavigate, B as Button, L as Link, P as toast } from "./router-BOWNgUDI.js";
import { s as supabase } from "./client-D_JDeqRk.js";
import { I as Input } from "./input-FoJXCvaT.js";
import { L as Label } from "./label-Dg6YeEYY.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./auth-middleware-Bv2O2VNV.js";
import "./index-BlRNeFf7.js";
import "./player-sports-D0yo17RI.js";
function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : void 0,
        data: {
          full_name: fullName,
          phone,
          account_type: "player"
        }
      }
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Check your email to verify.");
    navigate({
      to: "/login"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Create account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Player account — book turfs and build your player card." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Full name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", required: true, value: fullName, onChange: (e) => setFullName(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "phone", type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating…" : "Create account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
      "Already have one? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-semibold text-primary hover:underline", children: "Log in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-2 inline-block", children: [
        "List a turf?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/register", className: "font-semibold text-primary hover:underline", children: "Create a partner account" })
      ] })
    ] })
  ] });
}
export {
  SignupPage as component
};
