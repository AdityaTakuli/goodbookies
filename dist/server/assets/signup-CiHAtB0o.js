import { l as createServerFn, _ as reactExports, Q as jsxRuntimeExports } from "./server-y2W0Yarm.js";
import { j as createLucideIcon, l as createSsrRpc, g as cn, V as useNavigate, B as Button, L as Link, P as toast } from "./router-D-F9n8aG.js";
import { u as useServerFn } from "./useServerFn-DBBp1hm0.js";
import { s as supabase } from "./client-DbP4T9yH.js";
import { o as objectType, s as stringType } from "./types-DeUvCBv7.js";
import { i as isValidIndianPhone, f as formatIndianPhoneDisplay, n as normalizeIndianPhone } from "./phone-DJVzxjRj.js";
import { I as Input } from "./input-BiwIXRgg.js";
import { L as Label } from "./label-DGORqtI6.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./auth-middleware-CnnHPM4L.js";
import "./index-BlRNeFf7.js";
import "./player-sports-D0yo17RI.js";
const __iconNode = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode);
const checkPhoneAvailable = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  phone: stringType().min(10).max(20)
}).parse(input)).handler(createSsrRpc("356233ab538099e723566e80a761c0e3d7afe85c53224308bed9d35f74638f03"));
var Bt = Object.defineProperty, At = Object.defineProperties;
var kt = Object.getOwnPropertyDescriptors;
var Y = Object.getOwnPropertySymbols;
var gt = Object.prototype.hasOwnProperty, Et = Object.prototype.propertyIsEnumerable;
var vt = (r, s, e) => s in r ? Bt(r, s, { enumerable: true, configurable: true, writable: true, value: e }) : r[s] = e, St = (r, s) => {
  for (var e in s || (s = {})) gt.call(s, e) && vt(r, e, s[e]);
  if (Y) for (var e of Y(s)) Et.call(s, e) && vt(r, e, s[e]);
  return r;
}, bt = (r, s) => At(r, kt(s));
var Pt = (r, s) => {
  var e = {};
  for (var u in r) gt.call(r, u) && s.indexOf(u) < 0 && (e[u] = r[u]);
  if (r != null && Y) for (var u of Y(r)) s.indexOf(u) < 0 && Et.call(r, u) && (e[u] = r[u]);
  return e;
};
function ht(r) {
  let s = setTimeout(r, 0), e = setTimeout(r, 10), u = setTimeout(r, 50);
  return [s, e, u];
}
function _t(r) {
  let s = reactExports.useRef();
  return reactExports.useEffect(() => {
    s.current = r;
  }), s.current;
}
var Ot = 18, wt = 40, Gt = `${wt}px`, xt = ["[data-lastpass-icon-root]", "com-1password-button", "[data-dashlanecreated]", '[style$="2147483647 !important;"]'].join(",");
function Tt({ containerRef: r, inputRef: s, pushPasswordManagerStrategy: e, isFocused: u }) {
  let [P, D] = reactExports.useState(false), [G, H] = reactExports.useState(false), [F, W] = reactExports.useState(false), Z = reactExports.useMemo(() => e === "none" ? false : (e === "increase-width" || e === "experimental-no-flickering") && P && G, [P, G, e]), T = reactExports.useCallback(() => {
    let f = r.current, h = s.current;
    if (!f || !h || F || e === "none") return;
    let a = f, B = a.getBoundingClientRect().left + a.offsetWidth, A = a.getBoundingClientRect().top + a.offsetHeight / 2, z = B - Ot, q = A;
    document.querySelectorAll(xt).length === 0 && document.elementFromPoint(z, q) === f || (D(true), W(true));
  }, [r, s, F, e]);
  return reactExports.useEffect(() => {
    let f = r.current;
    if (!f || e === "none") return;
    function h() {
      let A = window.innerWidth - f.getBoundingClientRect().right;
      H(A >= wt);
    }
    h();
    let a = setInterval(h, 1e3);
    return () => {
      clearInterval(a);
    };
  }, [r, e]), reactExports.useEffect(() => {
    let f = u || document.activeElement === s.current;
    if (e === "none" || !f) return;
    let h = setTimeout(T, 0), a = setTimeout(T, 2e3), B = setTimeout(T, 5e3), A = setTimeout(() => {
      W(true);
    }, 6e3);
    return () => {
      clearTimeout(h), clearTimeout(a), clearTimeout(B), clearTimeout(A);
    };
  }, [s, u, e, T]), { hasPWMBadge: P, willPushPWMBadge: Z, PWM_BADGE_SPACE_WIDTH: Gt };
}
var jt = reactExports.createContext({}), Lt = reactExports.forwardRef((A, B) => {
  var z = A, { value: r, onChange: s, maxLength: e, textAlign: u = "left", pattern: P, placeholder: D, inputMode: G = "numeric", onComplete: H, pushPasswordManagerStrategy: F = "increase-width", pasteTransformer: W, containerClassName: Z, noScriptCSSFallback: T = Nt, render: f, children: h } = z, a = Pt(z, ["value", "onChange", "maxLength", "textAlign", "pattern", "placeholder", "inputMode", "onComplete", "pushPasswordManagerStrategy", "pasteTransformer", "containerClassName", "noScriptCSSFallback", "render", "children"]);
  var X, lt, ut, dt, ft;
  let [q, nt] = reactExports.useState(typeof a.defaultValue == "string" ? a.defaultValue : ""), i = r != null ? r : q, I = _t(i), x = reactExports.useCallback((t) => {
    s == null || s(t), nt(t);
  }, [s]), m = reactExports.useMemo(() => P ? typeof P == "string" ? new RegExp(P) : P : null, [P]), l = reactExports.useRef(null), K = reactExports.useRef(null), J = reactExports.useRef({ value: i, onChange: x, isIOS: typeof window != "undefined" && ((lt = (X = window == null ? void 0 : window.CSS) == null ? void 0 : X.supports) == null ? void 0 : lt.call(X, "-webkit-touch-callout", "none")) }), V = reactExports.useRef({ prev: [(ut = l.current) == null ? void 0 : ut.selectionStart, (dt = l.current) == null ? void 0 : dt.selectionEnd, (ft = l.current) == null ? void 0 : ft.selectionDirection] });
  reactExports.useImperativeHandle(B, () => l.current, []), reactExports.useEffect(() => {
    let t = l.current, o = K.current;
    if (!t || !o) return;
    J.current.value !== t.value && J.current.onChange(t.value), V.current.prev = [t.selectionStart, t.selectionEnd, t.selectionDirection];
    function d() {
      if (document.activeElement !== t) {
        L(null), N(null);
        return;
      }
      let c = t.selectionStart, b = t.selectionEnd, mt = t.selectionDirection, v = t.maxLength, C = t.value, _ = V.current.prev, g = -1, E = -1, w;
      if (C.length !== 0 && c !== null && b !== null) {
        let Dt = c === b, Ht = c === C.length && C.length < v;
        if (Dt && !Ht) {
          let y = c;
          if (y === 0) g = 0, E = 1, w = "forward";
          else if (y === v) g = y - 1, E = y, w = "backward";
          else if (v > 1 && C.length > 1) {
            let et = 0;
            if (_[0] !== null && _[1] !== null) {
              w = y < _[1] ? "backward" : "forward";
              let Wt = _[0] === _[1] && _[0] < v;
              w === "backward" && !Wt && (et = -1);
            }
            g = et + y, E = et + y + 1;
          }
        }
        g !== -1 && E !== -1 && g !== E && l.current.setSelectionRange(g, E, w);
      }
      let pt = g !== -1 ? g : c, Rt = E !== -1 ? E : b, yt = w != null ? w : mt;
      L(pt), N(Rt), V.current.prev = [pt, Rt, yt];
    }
    if (document.addEventListener("selectionchange", d, { capture: true }), d(), document.activeElement === t && Q(true), !document.getElementById("input-otp-style")) {
      let c = document.createElement("style");
      if (c.id = "input-otp-style", document.head.appendChild(c), c.sheet) {
        let b = "background: transparent !important; color: transparent !important; border-color: transparent !important; opacity: 0 !important; box-shadow: none !important; -webkit-box-shadow: none !important; -webkit-text-fill-color: transparent !important;";
        $(c.sheet, "[data-input-otp]::selection { background: transparent !important; color: transparent !important; }"), $(c.sheet, `[data-input-otp]:autofill { ${b} }`), $(c.sheet, `[data-input-otp]:-webkit-autofill { ${b} }`), $(c.sheet, "@supports (-webkit-touch-callout: none) { [data-input-otp] { letter-spacing: -.6em !important; font-weight: 100 !important; font-stretch: ultra-condensed; font-optical-sizing: none !important; left: -1px !important; right: 1px !important; } }"), $(c.sheet, "[data-input-otp] + * { pointer-events: all !important; }");
      }
    }
    let R = () => {
      o && o.style.setProperty("--root-height", `${t.clientHeight}px`);
    };
    R();
    let p = new ResizeObserver(R);
    return p.observe(t), () => {
      document.removeEventListener("selectionchange", d, { capture: true }), p.disconnect();
    };
  }, []);
  let [ot, rt] = reactExports.useState(false), [j, Q] = reactExports.useState(false), [M, L] = reactExports.useState(null), [k, N] = reactExports.useState(null);
  reactExports.useEffect(() => {
    ht(() => {
      var R, p, c, b;
      (R = l.current) == null || R.dispatchEvent(new Event("input"));
      let t = (p = l.current) == null ? void 0 : p.selectionStart, o = (c = l.current) == null ? void 0 : c.selectionEnd, d = (b = l.current) == null ? void 0 : b.selectionDirection;
      t !== null && o !== null && (L(t), N(o), V.current.prev = [t, o, d]);
    });
  }, [i, j]), reactExports.useEffect(() => {
    I !== void 0 && i !== I && I.length < e && i.length === e && (H == null || H(i));
  }, [e, H, I, i]);
  let O = Tt({ containerRef: K, inputRef: l, pushPasswordManagerStrategy: F, isFocused: j }), st = reactExports.useCallback((t) => {
    let o = t.currentTarget.value.slice(0, e);
    if (o.length > 0 && m && !m.test(o)) {
      t.preventDefault();
      return;
    }
    typeof I == "string" && o.length < I.length && document.dispatchEvent(new Event("selectionchange")), x(o);
  }, [e, x, I, m]), at = reactExports.useCallback(() => {
    var t;
    if (l.current) {
      let o = Math.min(l.current.value.length, e - 1), d = l.current.value.length;
      (t = l.current) == null || t.setSelectionRange(o, d), L(o), N(d);
    }
    Q(true);
  }, [e]), ct = reactExports.useCallback((t) => {
    var g, E;
    let o = l.current;
    if (!W && (!J.current.isIOS || !t.clipboardData || !o)) return;
    let d = t.clipboardData.getData("text/plain"), R = W ? W(d) : d;
    t.preventDefault();
    let p = (g = l.current) == null ? void 0 : g.selectionStart, c = (E = l.current) == null ? void 0 : E.selectionEnd, v = (p !== c ? i.slice(0, p) + R + i.slice(c) : i.slice(0, p) + R + i.slice(p)).slice(0, e);
    if (v.length > 0 && m && !m.test(v)) return;
    o.value = v, x(v);
    let C = Math.min(v.length, e - 1), _ = v.length;
    o.setSelectionRange(C, _), L(C), N(_);
  }, [e, x, m, i]), It = reactExports.useMemo(() => ({ position: "relative", cursor: a.disabled ? "default" : "text", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "none" }), [a.disabled]), it = reactExports.useMemo(() => ({ position: "absolute", inset: 0, width: O.willPushPWMBadge ? `calc(100% + ${O.PWM_BADGE_SPACE_WIDTH})` : "100%", clipPath: O.willPushPWMBadge ? `inset(0 ${O.PWM_BADGE_SPACE_WIDTH} 0 0)` : void 0, height: "100%", display: "flex", textAlign: u, opacity: "1", color: "transparent", pointerEvents: "all", background: "transparent", caretColor: "transparent", border: "0 solid transparent", outline: "0 solid transparent", boxShadow: "none", lineHeight: "1", letterSpacing: "-.5em", fontSize: "var(--root-height)", fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }), [O.PWM_BADGE_SPACE_WIDTH, O.willPushPWMBadge, u]), Mt = reactExports.useMemo(() => reactExports.createElement("input", bt(St({ autoComplete: a.autoComplete || "one-time-code" }, a), { "data-input-otp": true, "data-input-otp-placeholder-shown": i.length === 0 || void 0, "data-input-otp-mss": M, "data-input-otp-mse": k, inputMode: G, pattern: m == null ? void 0 : m.source, "aria-placeholder": D, style: it, maxLength: e, value: i, ref: l, onPaste: (t) => {
    var o;
    ct(t), (o = a.onPaste) == null || o.call(a, t);
  }, onChange: st, onMouseOver: (t) => {
    var o;
    rt(true), (o = a.onMouseOver) == null || o.call(a, t);
  }, onMouseLeave: (t) => {
    var o;
    rt(false), (o = a.onMouseLeave) == null || o.call(a, t);
  }, onFocus: (t) => {
    var o;
    at(), (o = a.onFocus) == null || o.call(a, t);
  }, onBlur: (t) => {
    var o;
    Q(false), (o = a.onBlur) == null || o.call(a, t);
  } })), [st, at, ct, G, it, e, k, M, a, m == null ? void 0 : m.source, i]), tt = reactExports.useMemo(() => ({ slots: Array.from({ length: e }).map((t, o) => {
    var c;
    let d = j && M !== null && k !== null && (M === k && o === M || o >= M && o < k), R = i[o] !== void 0 ? i[o] : null, p = i[0] !== void 0 ? null : (c = D == null ? void 0 : D[o]) != null ? c : null;
    return { char: R, placeholderChar: p, isActive: d, hasFakeCaret: d && R === null };
  }), isFocused: j, isHovering: !a.disabled && ot }), [j, ot, e, k, M, a.disabled, i]), Ct = reactExports.useMemo(() => f ? f(tt) : reactExports.createElement(jt.Provider, { value: tt }, h), [h, tt, f]);
  return reactExports.createElement(reactExports.Fragment, null, T !== null && reactExports.createElement("noscript", null, reactExports.createElement("style", null, T)), reactExports.createElement("div", { ref: K, "data-input-otp-container": true, style: It, className: Z }, Ct, reactExports.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none" } }, Mt)));
});
Lt.displayName = "Input";
function $(r, s) {
  try {
    r.insertRule(s);
  } catch (e) {
    console.error("input-otp could not insert CSS rule:", s);
  }
}
var Nt = `
[data-input-otp] {
  --nojs-bg: white !important;
  --nojs-fg: black !important;

  background-color: var(--nojs-bg) !important;
  color: var(--nojs-fg) !important;
  caret-color: var(--nojs-fg) !important;
  letter-spacing: .25em !important;
  text-align: center !important;
  border: 1px solid var(--nojs-fg) !important;
  border-radius: 4px !important;
  width: 100% !important;
}
@media (prefers-color-scheme: dark) {
  [data-input-otp] {
    --nojs-bg: black !important;
    --nojs-fg: white !important;
  }
}`;
const InputOTP = reactExports.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Lt,
  {
    ref,
    containerClassName: cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    ),
    className: cn("disabled:cursor-not-allowed", className),
    ...props
  }
));
InputOTP.displayName = "InputOTP";
const InputOTPGroup = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center", className), ...props }));
InputOTPGroup.displayName = "InputOTPGroup";
const InputOTPSlot = reactExports.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = reactExports.useContext(jt);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref,
      className: cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      ),
      ...props,
      children: [
        char,
        hasFakeCaret && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" }) })
      ]
    }
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
const InputOTPSeparator = reactExports.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, role: "separator", ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, {}) }));
InputOTPSeparator.displayName = "InputOTPSeparator";
function SignupPage() {
  const navigate = useNavigate();
  const checkPhoneFn = useServerFn(checkPhoneAvailable);
  const [step, setStep] = reactExports.useState("form");
  const [fullName, setFullName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [otp, setOtp] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  async function onSendOtp(e) {
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
          to: "/account"
        });
        return;
      }
      setStep("otp");
      toast.success(`Enter the 6-digit code sent to ${email}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }
  async function onVerifyOtp(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: "signup"
      });
      if (error) {
        const retry = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otp,
          type: "email"
        });
        if (retry.error) throw retry.error;
        if (retry.data.session) {
          toast.success("Email verified — welcome!");
          navigate({
            to: "/account"
          });
          return;
        }
        throw error;
      }
      if (data.session) {
        toast.success("Email verified — welcome!");
        navigate({
          to: "/account"
        });
        return;
      }
      toast.success("Verified! You can log in now.");
      navigate({
        to: "/login"
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }
  async function onResendOtp() {
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase()
      });
      if (error) throw error;
      toast.success("New code sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend code");
    } finally {
      setLoading(false);
    }
  }
  if (step === "otp") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Verify your email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        "We sent a 6-digit code to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: email }),
        isValidIndianPhone(phone) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " ",
          "· Phone ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: formatIndianPhoneDisplay(normalizeIndianPhone(phone)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: onVerifyOtp, className: "mt-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "otp", children: "Verification code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTP, { id: "otp", maxLength: 6, value: otp, onChange: setOtp, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(InputOTPGroup, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 2 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 3 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 4 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputOTPSlot, { index: 5 })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading || otp.length !== 6, children: loading ? "Verifying…" : "Verify & create account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 text-center text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-primary hover:underline disabled:opacity-50", onClick: onResendOtp, disabled: loading, children: "Resend code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-muted-foreground hover:underline", onClick: () => {
            setStep("form");
            setOtp("");
          }, children: "← Back to sign up" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto flex max-w-md flex-col px-4 py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Create account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Player account — we verify your email with a one-time code (no link required). One phone per account." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: onSendOtp, className: "mt-8 space-y-4", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "10-digit Indian mobile — one account per number" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Sending code…" : "Send verification code" })
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
