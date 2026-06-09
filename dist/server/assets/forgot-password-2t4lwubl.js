import { _ as reactExports, Q as jsxRuntimeExports } from "./server-BXvBfJmB.js";
import { L as Link, B as Button, _ as toast } from "./router-Cc137mAD.js";
import { s as supabase } from "./client-BjQiAFWG.js";
import { a as authRedirectUrl } from "./auth-redirect-CzotwTAz.js";
import { I as Input } from "./input-BB8XFwhB.js";
import { L as Label } from "./label-bW_2Q9Jr.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./urls-Bl7AuvTg.js";
import "./auth-middleware-EZaG0r_C.js";
import "./index-BlRNeFf7.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
function ForgotPasswordPage() {
  const [email, setEmail] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: authRedirectUrl("/reset-password")
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent. Check your email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }
  if (sent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Check your email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
        "If an account exists for ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: email }),
        ", we sent a link to set a new password. The link opens on this site."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "mt-8 text-sm font-semibold text-primary hover:underline", children: "Back to log in" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Forgot password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Enter your email and we'll send a secure link to choose a new password." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, autoComplete: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Sending…" : "Send reset link" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-semibold text-primary hover:underline", children: "← Back to log in" }) })
  ] });
}
export {
  ForgotPasswordPage as component
};
