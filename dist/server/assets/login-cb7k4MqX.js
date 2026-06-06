import { Z as reactExports, P as jsxRuntimeExports } from "./server-BUgKRY45.js";
import { V as useNavigate, b as Route, B as Button, L as Link, P as toast } from "./router-DZRJpc5E.js";
import { s as supabase } from "./client-D_JDeqRk.js";
import { I as Input } from "./input-DdPjRUpB.js";
import { L as Label } from "./label-D7uqVxeI.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./auth-middleware-_1Ajsed4.js";
import "./index-BlRNeFf7.js";
import "./player-sports-D0yo17RI.js";
function LoginPage() {
  const navigate = useNavigate();
  const {
    redirect
  } = Route.useSearch();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({
      to: redirect ?? "/account"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Log in" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Log in to book turfs, manage My Player Card, or access Partner if you list venues." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Signing in…" : "Sign in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
      "No account yet? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/signup", className: "font-semibold text-primary hover:underline", children: "Sign up" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-2 inline-block", children: [
        "List a turf?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/register", className: "font-semibold text-primary hover:underline", children: "Add partner access" })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
