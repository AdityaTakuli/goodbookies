import { Z as reactExports, P as jsxRuntimeExports } from "./server-DhhSyQbI.js";
import { V as useNavigate, B as Button, L as Link, P as toast } from "./router-CTX0SWVZ.js";
import { s as supabase } from "./client-CgZxP6gM.js";
import { u as useServerFn } from "./useServerFn-DaE5J3IH.js";
import { g as getOwnerStatus } from "./owner.functions-C8PSWmc4.js";
import { I as Input } from "./input-DH8QQEJZ.js";
import { L as Label } from "./label-C4BTFF1n.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./auth-middleware-DMywVex_.js";
import "./index-BlRNeFf7.js";
import "./player-sports-D0yo17RI.js";
function OwnerLogin() {
  const navigate = useNavigate();
  const statusFn = useServerFn(getOwnerStatus);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const onSubmit = async (e) => {
    e.preventDefault();
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    try {
      const owner = await statusFn();
      if (!owner) {
        toast.message("Logged in. Add partner access to list your venue.");
        navigate({
          to: "/owner/register"
        });
        return;
      }
      if (owner.status === "pending") {
        toast.message("Your partner application is pending approval.");
      } else if (owner.status === "rejected") {
        toast.message(owner.rejection_reason ?? "Your application was not approved.");
      } else if (owner.status === "suspended") {
        toast.message("Your partner account is suspended.");
      }
      navigate({
        to: "/owner"
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-md px-4 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold", children: "Owner Login" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Same email as your player account works here too." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Log in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
        "Need a partner account? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/owner/register", className: "text-primary hover:underline", children: "Register" })
      ] })
    ] })
  ] });
}
export {
  OwnerLogin as component
};
