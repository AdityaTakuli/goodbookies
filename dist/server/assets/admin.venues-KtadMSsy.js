import { _ as reactExports, Q as jsxRuntimeExports } from "./server-f42zMdPM.js";
import { u as useQuery } from "./useQuery-Db7M-IZx.js";
import { W as useQueryClient, B as Button, P as toast } from "./router-C0Rlkb4r.js";
import { u as useServerFn } from "./useServerFn-BlyWwaOC.js";
import { m as adminListVenues, k as adminListSports, x as adminUpsertVenue, f as adminDeleteVenue } from "./admin.functions-CRiMo5JZ.js";
import { I as Input } from "./input-pOBya31c.js";
import { L as Label } from "./label-CUVdXgru.js";
import { T as Textarea } from "./textarea-BfBgnMSe.js";
import { D as Dialog, d as DialogTrigger, e as Plus, a as DialogContent, b as DialogHeader, c as DialogTitle, P as Pencil } from "./dialog-BeefypKc.js";
import { M as MediaUploadField, T as Trash2 } from "./MediaUploadField-X8QHWz80.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-DFEGQ_ZH.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-Bk72s03E.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
import "./index-DI0aTpVL.js";
import "./index-DhQpIcd5.js";
import "./index-66go5Cqz.js";
import "./upload-client-XxKS3KN7.js";
import "./config-B_G86tQ8.js";
import "./urls-DPcy6Sd_.js";
function emptyVenue(sportId) {
  return {
    name: "",
    slug: "",
    sport_id: sportId,
    city: "",
    address: "",
    description: "",
    image_url: "",
    price_per_hour: 500,
    opening_hour: 6,
    closing_hour: 22,
    is_active: true
  };
}
function AdminVenues() {
  const listFn = useServerFn(adminListVenues);
  const sportsFn = useServerFn(adminListSports);
  const upsertFn = useServerFn(adminUpsertVenue);
  const delFn = useServerFn(adminDeleteVenue);
  const qc = useQueryClient();
  const {
    data: venues,
    isLoading
  } = useQuery({
    queryKey: ["admin-venues"],
    queryFn: () => listFn()
  });
  const {
    data: sports
  } = useQuery({
    queryKey: ["admin-sports"],
    queryFn: () => sportsFn()
  });
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const openNew = () => {
    if (!sports?.length) {
      toast.error("Add a sport first");
      return;
    }
    setEditing({
      values: emptyVenue(sports[0].id)
    });
    setOpen(true);
  };
  const openEdit = (v) => {
    setEditing({
      id: v.id,
      values: {
        name: v.name,
        slug: v.slug,
        sport_id: v.sport_id ?? sports?.find((s) => s.slug === v.sport?.slug)?.id ?? "",
        city: v.city,
        address: v.address,
        description: v.description ?? "",
        image_url: v.image_url ?? "",
        price_per_hour: v.price_per_hour,
        opening_hour: v.opening_hour,
        closing_hour: v.closing_hour,
        is_active: v.is_active
      }
    });
    setOpen(true);
  };
  const onSave = async () => {
    if (!editing) return;
    try {
      const values = {
        ...editing.values,
        description: editing.values.description || null,
        image_url: editing.values.image_url || null
      };
      await upsertFn({
        data: {
          id: editing.id,
          values
        }
      });
      toast.success(editing.id ? "Venue updated" : "Venue created");
      setOpen(false);
      qc.invalidateQueries({
        queryKey: ["admin-venues"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  const onDelete = async (id) => {
    if (!confirm("Deactivate this venue?")) return;
    try {
      await delFn({
        data: {
          id
        }
      });
      toast.success("Venue deactivated");
      qc.invalidateQueries({
        queryKey: ["admin-venues"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "Venues" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          venues?.length ?? 0,
          " venues"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openNew, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add venue"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing?.id ? "Edit venue" : "New venue" }) }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.name, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                name: e.target.value
              }
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Slug (URL)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.slug, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                slug: e.target.value
              }
            }), placeholder: "lowercase-hyphen" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Sport", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-10 w-full rounded-md border border-input bg-input px-3 text-sm", value: editing.values.sport_id, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                sport_id: e.target.value
              }
            }), children: sports?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.name }, s.id)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.city, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  city: e.target.value
                }
              }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Price / hour (₹)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.values.price_per_hour, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  price_per_hour: Number(e.target.value)
                }
              }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Address", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.address, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                address: e.target.value
              }
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(MediaUploadField, { category: "venues", label: "Turf photo", hint: "JPEG, PNG or WebP · max 5 MB · stored in venue MySQL (gb_venues)", value: editing.values.image_url ?? null, onChange: (path) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                image_url: path ?? ""
              }
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: editing.values.description ?? "", onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                description: e.target.value
              }
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Opens (0-23)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 23, value: editing.values.opening_hour, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  opening_hour: Number(e.target.value)
                }
              }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Closes (1-24)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 24, value: editing.values.closing_hour, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  closing_hour: Number(e.target.value)
                }
              }) }) })
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
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSave, children: "Save" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Sport" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "City" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "₹/hr" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 font-medium text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          (venues ?? []).map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 font-medium", children: v.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: v.sport?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-muted-foreground", children: v.city }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: v.price_per_hour }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-semibold ${v.is_active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`, children: v.is_active ? "active" : "inactive" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => openEdit(v), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              v.is_active && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => onDelete(v.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
            ] })
          ] }, v.id)),
          !isLoading && (venues ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "py-6 text-center text-sm text-muted-foreground", children: "No venues yet." }) })
        ] })
      ] }) })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
    children
  ] });
}
export {
  AdminVenues as component
};
