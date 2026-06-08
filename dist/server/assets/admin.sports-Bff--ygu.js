import { _ as reactExports, Q as jsxRuntimeExports } from "./server-C1SlovkB.js";
import { u as useQuery } from "./useQuery-CX216jFu.js";
import { _ as useQueryClient, B as Button, U as toast } from "./router-Dx7LtDHP.js";
import { u as useServerFn } from "./useServerFn-ChSn65jp.js";
import { k as adminListSports, w as adminUpsertSport } from "./admin.functions-B9bdH3oQ.js";
import { I as Input } from "./input-BLVciLwu.js";
import { L as Label } from "./label-DAgH9NPC.js";
import { D as Dialog, d as DialogTrigger, e as Plus, a as DialogContent, b as DialogHeader, c as DialogTitle, P as Pencil } from "./dialog-COpYu2c5.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-BAJP6Nx0.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./urls-l-aaheEG.js";
import "./auth-middleware-B3M4xANW.js";
import "./types-DeUvCBv7.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
import "./index-BFIPQ_2W.js";
import "./index-D8ssawG1.js";
import "./index-CtVbbtfg.js";
function AdminSports() {
  const listFn = useServerFn(adminListSports);
  const upsertFn = useServerFn(adminUpsertSport);
  const qc = useQueryClient();
  const {
    data: sports,
    isLoading
  } = useQuery({
    queryKey: ["admin-sports-all"],
    queryFn: () => listFn()
  });
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const save = async () => {
    if (!editing) return;
    try {
      await upsertFn({
        data: {
          id: editing.id,
          values: {
            ...editing.values,
            icon: editing.values.icon || null
          }
        }
      });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({
        queryKey: ["admin-sports-all"]
      });
      qc.invalidateQueries({
        queryKey: ["admin-sports"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Sports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          sports?.length ?? 0,
          " sports"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing({
            values: {
              name: "",
              slug: "",
              icon: "",
              is_active: true
            }
          });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add sport"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing?.id ? "Edit sport" : "New sport" }) }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.name, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  name: e.target.value
                }
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Slug" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.slug, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  slug: e.target.value
                }
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Icon (emoji)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.icon ?? "", onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  icon: e.target.value
                }
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: editing.values.is_active, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  is_active: e.target.checked
                }
              }) }),
              "Active"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: "Save" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: (sports ?? []).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border/60 bg-background p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-xl", children: s.icon || "🏟️" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: s.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              s.slug,
              !s.is_active && " · inactive"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
          setEditing({
            id: s.id,
            values: {
              name: s.name,
              slug: s.slug,
              icon: s.icon,
              is_active: s.is_active
            }
          });
          setOpen(true);
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) })
      ] }, s.id)) })
    ] })
  ] });
}
export {
  AdminSports as component
};
