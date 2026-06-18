import { l as createServerFn, _ as reactExports, Q as jsxRuntimeExports } from "./server-CYzZ9eUw.js";
import { s as createLucideIcon, ab as useNavigate, B as Button, c as Link, d as PLAYER_HOME, a7 as toast } from "./router-C0WOwQSW.js";
import { u as useServerFn } from "./useServerFn-DPxroKJC.js";
import { s as supabase } from "./client-BjQiAFWG.js";
import { c as createSsrRpc } from "./urls-IKbc85gj.js";
import { o as objectType, s as stringType } from "./types-DeUvCBv7.js";
import { i as isValidIndianPhone, f as formatIndianPhoneDisplay, n as normalizeIndianPhone } from "./phone-DJVzxjRj.js";
import { a as authRedirectUrl } from "./auth-redirect-CzotwTAz.js";
import { I as Input } from "./input-D5qC7SZB.js";
import { L as Label } from "./label-CQiXMyrU.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./cancellation-policy-Be0g0_Zy.js";
import "./pricing-DOPRXSDA.js";
import "./client.server-CQTuKCic.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-CL6_siGS.js";
import "./player-sports-D0yo17RI.js";
const __iconNode = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
const Mail = createLucideIcon("mail", __iconNode);
const checkPhoneAvailable = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  phone: stringType().min(10).max(20)
}).parse(input)).handler(createSsrRpc("356233ab538099e723566e80a761c0e3d7afe85c53224308bed9d35f74638f03"));
function SignupPage() {
  const navigate = useNavigate();
  const checkPhoneFn = useServerFn(checkPhoneAvailable);
  const [sent, setSent] = reactExports.useState(false);
  const [fullName, setFullName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function onSubmit(e) {
    e.preventDefault();
    if (!isValidIndianPhone(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    try {
      const normalized = normalizeIndianPhone(phone);
      await checkPhoneFn({
        data: {
          phone: normalized
        }
      });
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: authRedirectUrl(PLAYER_HOME),
          data: {
            full_name: fullName.trim(),
            phone: normalized,
            account_type: "player"
          }
        }
      });
      if (error) throw error;
      if (data.session) {
        toast.success("Account created!");
        navigate({
          to: PLAYER_HOME
        });
        return;
      }
      setSent(true);
      toast.success("Check your email for the confirmation link");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }
  async function onResendLink() {
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: authRedirectUrl(PLAYER_HOME)
        }
      });
      if (error) throw error;
      toast.success("Confirmation link sent again");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend link");
    } finally {
      setLoading(false);
    }
  }
  if (sent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-3xl font-bold", children: "Check your email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "We sent a confirmation link to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: email }),
        ". Click the link to activate your account and browse available turfs."
      ] }),
      isValidIndianPhone(phone) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "Phone on file:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: formatIndianPhoneDisplay(normalizeIndianPhone(phone)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: onResendLink, disabled: loading, children: loading ? "Sending…" : "Resend confirmation link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "w-full text-center text-sm text-muted-foreground hover:underline", onClick: () => setSent(false), children: "← Back to sign up" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Already confirmed? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-semibold text-primary hover:underline", children: "Log in" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Create account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Player account. We'll email you a confirmation link. One phone per account." }),
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone (unique)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "phone", type: "tel", required: true, inputMode: "numeric", placeholder: "9876543210", value: phone, onChange: (e) => setPhone(e.target.value), className: "mt-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "10-digit Indian mobile, one account per number" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating account…" : "Create account" })
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
