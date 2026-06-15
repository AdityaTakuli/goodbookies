import { _ as reactExports, Q as jsxRuntimeExports } from "./server-BtUn1Hgv.js";
import { a2 as useNavigate, b as Route, L as Link, B as Button, _ as toast, M as resolvePlayerLoginPath } from "./router-p2oW4M6C.js";
import { s as supabase } from "./client-BjQiAFWG.js";
import { I as Input } from "./input-Dg5TW3Rc.js";
import { L as Label } from "./label-CCGd4mD3.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./urls-CDalmZy3.js";
import "./auth-middleware-CO-X9AGf.js";
import "./index-BlRNeFf7.js";
import "./types-DeUvCBv7.js";
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
    const {
      data: userData
    } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    let destination = resolvePlayerLoginPath(redirect);
    if (!redirect && uid) {
      const {
        data: adminRow
      } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      if (adminRow) destination = "/admin";
    }
    toast.success("Welcome back!");
    navigate({
      to: destination
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Log in" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
      "Log in to browse and book turfs. Turf partners should use",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/login", className: "font-medium text-primary hover:underline", children: "Partner login" }),
      "."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "text-xs font-medium text-primary hover:underline", children: "Forgot password?" })
        ] }),
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
