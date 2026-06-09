import { _ as reactExports, Q as jsxRuntimeExports } from "./server-CorN6qw5.js";
import { u as useQuery } from "./useQuery-l73bW2nc.js";
import { a3 as useQueryClient, B as Button, _ as toast } from "./router-EbU1nqEp.js";
import { u as useServerFn } from "./useServerFn-CHx2_dnm.js";
import { s as adminSendNotification, o as adminNotificationLog } from "./admin.functions-CuoDurw4.js";
import { I as Input } from "./input-cUR-XHHk.js";
import { L as Label } from "./label-CF4Y9cXr.js";
import { T as Textarea } from "./textarea-CsVASS5n.js";
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
function AdminNotifications() {
  const sendFn = useServerFn(adminSendNotification);
  const logFn = useServerFn(adminNotificationLog);
  const qc = useQueryClient();
  const {
    data: log
  } = useQuery({
    queryKey: ["admin-notif-log"],
    queryFn: () => logFn()
  });
  const [title, setTitle] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const onSend = async () => {
    if (!title.trim() || !message.trim()) return;
    try {
      const res = await sendFn({
        data: {
          title,
          message,
          target_type: "all",
          channel: "in-app"
        }
      });
      toast.success(`Sent to ${res.count} users`);
      setTitle("");
      setMessage("");
      qc.invalidateQueries({
        queryKey: ["admin-notif-log"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Notifications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Send bulk in-app messages." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg space-y-4 rounded-2xl border border-border/60 bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Message" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: message, onChange: (e) => setMessage(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSend, children: "Send to all users" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Sent log" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
        (log ?? []).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/40 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: n.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: n.sent_at?.slice(0, 16).replace("T", " ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: n.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
            "Delivered: ",
            n.delivery_count,
            " · ",
            n.channel
          ] })
        ] }, n.id)),
        (!log || log.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No notifications sent yet." })
      ] })
    ] })
  ] });
}
export {
  AdminNotifications as component
};
