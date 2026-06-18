import { Q as jsxRuntimeExports } from "./server-CJcsSZnB.js";
import { d as Link, a as LegalBusinessIdentity, c as LegalPolicyLinks, L as LEGAL_ENTITY } from "./router-C57BC541.js";
function LegalPageLayout({ title, intro, sections }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-3xl px-4 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-8 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:text-primary", children: "Home" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2", children: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 rounded-2xl border border-border/60 bg-card/40 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LegalBusinessIdentity, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold tracking-tight md:text-4xl", children: title }),
    intro && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: intro }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 space-y-8", children: sections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-card/40 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-foreground", children: section.question }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line", children: section.answer })
    ] }, section.question)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-2xl border border-border/60 bg-card/20 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-foreground/80", children: "Other policies" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LegalPolicyLinks, { className: "mt-3", inline: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-xs text-muted-foreground", children: [
      "Last updated: June 2026. For questions, contact",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${LEGAL_ENTITY.email}`, className: "text-primary hover:underline", children: LEGAL_ENTITY.email }),
      "."
    ] })
  ] });
}
export {
  LegalPageLayout as L
};
