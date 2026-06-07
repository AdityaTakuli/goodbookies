import { _ as reactExports, Q as jsxRuntimeExports } from "./server-Dio2SAfm.js";
import { u as useQuery } from "./useQuery-D1etozVn.js";
import { x as listSports, W as useQueryClient, B as Button, P as toast } from "./router-09TzdVmz.js";
import { u as useServerFn } from "./useServerFn-_4rOxIQu.js";
import { t as ownerListVenues, F as ownerUpsertVenue, l as ownerDeleteVenue } from "./owner.functions-V_x8vsJc.js";
import { I as Input } from "./input-DbD-L8xc.js";
import { L as Label } from "./label-FJh7MXRP.js";
import { T as Textarea } from "./textarea-S-ctgqB_.js";
import { D as Dialog, d as DialogTrigger, e as Plus, a as DialogContent, b as DialogHeader, c as DialogTitle, P as Pencil } from "./dialog-XSBLkZGV.js";
import { M as MediaUploadField, T as Trash2 } from "./MediaUploadField-C_O-AGQ_.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./useBaseQuery-DdVxSSFG.js";
import "./client-DbP4T9yH.js";
import "./index-BlRNeFf7.js";
import "./auth-middleware-BZQ_Ksej.js";
import "./player-sports-D0yo17RI.js";
import "./paths-BeoFimim.js";
import "./index-aUspr2K2.js";
import "./index-AtX7k0S0.js";
import "./index-B0KpGYXf.js";
import "./upload-client-BS3TBV2r.js";
import "./config-B_G86tQ8.js";
import "./urls-DPcy6Sd_.js";
function OwnerVenues() {
  const listFn = useServerFn(ownerListVenues);
  const sportsFn = useServerFn(listSports);
  const upsertFn = useServerFn(ownerUpsertVenue);
  const delFn = useServerFn(ownerDeleteVenue);
  const qc = useQueryClient();
  const {
    data: venues,
    isLoading
  } = useQuery({
    queryKey: ["owner-venues"],
    queryFn: () => listFn()
  });
  const {
    data: sports
  } = useQuery({
    queryKey: ["sports-list"],
    queryFn: () => sportsFn()
  });
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!editing || editing.values.sport_id || !sports?.length) return;
    setEditing((prev) => prev ? {
      ...prev,
      values: {
        ...prev.values,
        sport_id: sports[0].id
      }
    } : prev);
  }, [sports, editing]);
  const empty = () => ({
    name: "",
    slug: "",
    sport_id: sports?.[0]?.id ?? "",
    city: "",
    address: "",
    description: "",
    image_url: "",
    price_per_hour: 500,
    opening_hour: 6,
    closing_hour: 22,
    max_players_allowed: 10,
    confirmation_mode: "instant",
    advance_booking_days: 30
  });
  const save = async () => {
    if (!editing) return;
    if (!editing.values.sport_id) {
      toast.error("Please select a sport.");
      return;
    }
    const values = {
      ...editing.values,
      slug: String(editing.values.slug ?? "").trim().toLowerCase(),
      image_url: editing.values.image_url?.trim() ? editing.values.image_url.trim() : null,
      description: editing.values.description?.trim() ? editing.values.description.trim() : null
    };
    try {
      await upsertFn({
        data: {
          id: editing.id,
          values
        }
      });
      toast.success(editing.id ? "Venue updated" : "Venue created");
      setOpen(false);
      qc.invalidateQueries({
        queryKey: ["owner-venues"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold", children: "My venues" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          venues?.length ?? 0,
          " listings"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditing({
            values: empty()
          });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1 h-4 w-4" }),
          " Add venue"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto sm:max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing?.id ? "Edit venue" : "New venue" }) }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.name, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                name: e.target.value
              }
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Slug", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.slug, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                slug: e.target.value
              }
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Sport", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-10 w-full rounded-md border border-input bg-input px-3 text-sm", value: editing.values.sport_id, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                sport_id: e.target.value
              }
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Select a sport" }),
              sports?.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.name }, s.id))
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "City", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.city, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  city: e.target.value
                }
              }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "₹/hr", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: editing.values.price_per_hour, onChange: (e) => setEditing({
                ...editing,
                values: {
                  ...editing.values,
                  price_per_hour: Number(e.target.value)
                }
              }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Max players allowed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 100, value: editing.values.max_players_allowed ?? 10, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                max_players_allowed: Number(e.target.value) || 1
              }
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Address", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.values.address, onChange: (e) => setEditing({
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
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: editing.values.description ?? "", onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                description: e.target.value
              }
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(F, { label: "Confirmation", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-10 w-full rounded-md border border-input bg-input px-3 text-sm", value: editing.values.confirmation_mode, onChange: (e) => setEditing({
              ...editing,
              values: {
                ...editing.values,
                confirmation_mode: e.target.value
              }
            }), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "instant", children: "Instant confirm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manual", children: "Manual confirm" })
            ] }) }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: (venues ?? []).map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border/60 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: v.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            v.sport?.name,
            " · ",
            v.city,
            " · ₹",
            v.price_per_hour,
            "/hr"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${v.approval_status === "approved" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-400"}`, children: v.approval_status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
            setEditing({
              id: v.id,
              values: {
                ...v,
                sport_id: v.sport_id,
                confirmation_mode: v.confirmation_mode ?? "instant"
              }
            });
            setOpen(true);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
          v.is_active && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: async () => {
            if (confirm("Deactivate?")) {
              await delFn({
                data: {
                  id: v.id
                }
              });
              qc.invalidateQueries({
                queryKey: ["owner-venues"]
              });
            }
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
        ] })
      ] }) }, v.id)) })
    ] })
  ] });
}
function F({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs uppercase text-muted-foreground", children: label }),
    children
  ] });
}
export {
  OwnerVenues as component
};
