import { Q as jsxRuntimeExports } from "./server-f42zMdPM.js";
import { u as useQuery } from "./useQuery-Db7M-IZx.js";
import { W as useQueryClient, B as Button, P as toast } from "./router-C0Rlkb4r.js";
import { u as useServerFn } from "./useServerFn-BlyWwaOC.js";
import { l as listMyNotifications, m as markNotificationsRead } from "./account.functions-tzX3o6nI.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-DFEGQ_ZH.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-Bk72s03E.js";
import "./player-sports-D0yo17RI.js";
function AccountNotifications() {
  const listFn = useServerFn(listMyNotifications);
  const markFn = useServerFn(markNotificationsRead);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => listFn()
  });
  const markAll = async () => {
    try {
      await markFn();
      toast.success("All marked as read");
      qc.invalidateQueries({
        queryKey: ["my-notifications"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          data?.filter((n) => !n.is_read).length ?? 0,
          " unread"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: markAll, children: "Mark all read" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      (data ?? []).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border border-border/60 p-4 ${n.is_read ? "bg-card opacity-75" : "bg-primary/5"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: n.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: n.created_at?.slice(0, 10) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: n.message })
      ] }, n.id)),
      !isLoading && (data ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground", children: "No notifications yet." })
    ] })
  ] });
}
export {
  AccountNotifications as component
};
