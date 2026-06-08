import { _ as reactExports, Q as jsxRuntimeExports } from "./server-C1SlovkB.js";
import { Z as useNavigate, L as Link, B as Button, U as toast } from "./router-Dx7LtDHP.js";
import { s as supabase } from "./client-DbP4T9yH.js";
import { I as Input } from "./input-BLVciLwu.js";
import { L as Label } from "./label-DAgH9NPC.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./urls-l-aaheEG.js";
import "./auth-middleware-B3M4xANW.js";
import "./index-BlRNeFf7.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = reactExports.useState(false);
  const [checking, setChecking] = reactExports.useState(true);
  const [password, setPassword] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancelled = false;
    async function initRecoverySession() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const {
          error
        } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled && !error) setReady(true);
        if (!cancelled) setChecking(false);
        return;
      }
      const hash = window.location.hash;
      if (hash.includes("type=recovery") || hash.includes("access_token")) {
        const {
          data: data2,
          error
        } = await supabase.auth.getSession();
        if (!cancelled && !error && data2.session) setReady(true);
        if (!cancelled) setChecking(false);
        return;
      }
      const {
        data: {
          subscription
        }
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setChecking(false);
        }
      });
      const {
        data
      } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        setReady(true);
        setChecking(false);
      } else if (!cancelled) {
        setChecking(false);
      }
      return () => subscription.unsubscribe();
    }
    initRecoverySession();
    return () => {
      cancelled = true;
    };
  }, []);
  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password
      });
      if (error) throw error;
      toast.success("Password updated — you're logged in");
      navigate({
        to: "/account"
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }
  if (checking) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Verifying reset link…" }) });
  }
  if (!ready) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Link expired or invalid" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Request a new password reset link and open it from the same browser." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "mt-8 text-sm font-semibold text-primary hover:underline", children: "Request new link" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Set new password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Choose a new password for your account." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "New password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 6, autoComplete: "new-password", value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm", children: "Confirm password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "confirm", type: "password", required: true, minLength: 6, autoComplete: "new-password", value: confirm, onChange: (e) => setConfirm(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Saving…" : "Update password" })
    ] })
  ] });
}
export {
  ResetPasswordPage as component
};
