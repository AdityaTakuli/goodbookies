import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CorN6qw5.js";
import { u as useQuery } from "./useQuery-l73bW2nc.js";
import { a3 as useQueryClient, B as Button, _ as toast } from "./router-EbU1nqEp.js";
import { u as useServerFn } from "./useServerFn-CHx2_dnm.js";
import { l as adminListUsers, a as adminBanUser } from "./admin.functions-CuoDurw4.js";
import { I as Input } from "./input-cUR-XHHk.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-B9ekEVlR.js";
import "./client-BjQiAFWG.js";
import "./index-BlRNeFf7.js";
import "./urls-D-Qa20da.js";
import "./auth-middleware-DcElV_TJ.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
function AdminUsers() {
  const listFn = useServerFn(adminListUsers);
  const banFn = useServerFn(adminBanUser);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFn()
  });
  const [q, setQ] = reactExports.useState("");
  const toggleBan = async (id, banned) => {
    if (!confirm(banned ? "Ban this user?" : "Unban this user?")) return;
    try {
      await banFn({
        data: {
          id,
          banned
        }
      });
      toast.success(banned ? "User banned" : "User unbanned");
      qc.invalidateQueries({
        queryKey: ["admin-users"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  const filtered = reactExports.useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((u) => (u.full_name ?? "").toLowerCase().includes(needle) || (u.email ?? "").toLowerCase().includes(needle) || (u.phone ?? "").toLowerCase().includes(needle));
  }, [data, q]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Players" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "All registered players · ",
          filtered.length,
          " of ",
          data?.length ?? 0,
          " shown"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search name, email, phone", value: q, onChange: (e) => setQ(e.target.value), className: "w-64" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Phone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Joined" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Bookings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Spent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          filtered.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 font-medium", children: u.full_name || "N/A" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: u.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: u.phone || "N/A" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: u.created_at?.slice(0, 10) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: u.stats.count }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right font-semibold text-primary", children: [
              "₹",
              u.stats.spent.toLocaleString()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => toggleBan(u.id, !u.is_banned), children: u.is_banned ? "Unban" : "Ban" }) })
          ] }, u.id)),
          !isLoading && filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "py-6 text-center text-sm text-muted-foreground", children: "No users." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AdminUsers as component
};
