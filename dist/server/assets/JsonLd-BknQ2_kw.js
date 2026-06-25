import { Q as jsxRuntimeExports } from "./server-Cad_iNdE.js";
function JsonLd({ data }) {
  const json = JSON.stringify(data);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "script",
    {
      type: "application/ld+json",
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: { __html: json }
    }
  );
}
export {
  JsonLd as J
};
