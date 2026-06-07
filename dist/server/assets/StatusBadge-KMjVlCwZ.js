import { Q as jsxRuntimeExports } from "./server-Dio2SAfm.js";
function StatusBadge({ status }) {
  const cls = status === "confirmed" ? "bg-primary/15 text-primary" : status === "cancelled" ? "bg-destructive/15 text-destructive" : status === "pending" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${cls}`, children: status });
}
export {
  StatusBadge as S
};
