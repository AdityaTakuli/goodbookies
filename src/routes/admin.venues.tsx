import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListVenues, adminUpsertVenue, adminDeleteVenue, adminListSports } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/venues")({
  component: AdminVenues,
});

type VenueValues = {
  name: string; slug: string; sport_id: string; city: string; address: string;
  description?: string | null; image_url?: string | null;
  price_per_hour: number; opening_hour: number; closing_hour: number; is_active: boolean;
};

function emptyVenue(sportId: string): VenueValues {
  return { name: "", slug: "", sport_id: sportId, city: "", address: "", description: "", image_url: "", price_per_hour: 500, opening_hour: 6, closing_hour: 22, is_active: true };
}

function AdminVenues() {
  const listFn = useServerFn(adminListVenues);
  const sportsFn = useServerFn(adminListSports);
  const upsertFn = useServerFn(adminUpsertVenue);
  const delFn = useServerFn(adminDeleteVenue);
  const qc = useQueryClient();

  const { data: venues, isLoading } = useQuery({ queryKey: ["admin-venues"], queryFn: () => listFn() });
  const { data: sports } = useQuery({ queryKey: ["admin-sports"], queryFn: () => sportsFn() });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: string; values: VenueValues } | null>(null);

  const openNew = () => {
    if (!sports?.length) { toast.error("Add a sport first"); return; }
    setEditing({ values: emptyVenue(sports[0].id) });
    setOpen(true);
  };

  const openEdit = (v: any) => {
    setEditing({
      id: v.id,
      values: {
        name: v.name, slug: v.slug, sport_id: v.sport_id ?? sports?.find((s: any) => s.slug === v.sport?.slug)?.id ?? "",
        city: v.city, address: v.address, description: v.description ?? "", image_url: v.image_url ?? "",
        price_per_hour: v.price_per_hour, opening_hour: v.opening_hour, closing_hour: v.closing_hour, is_active: v.is_active,
      },
    });
    setOpen(true);
  };

  const onSave = async () => {
    if (!editing) return;
    try {
      const values = {
        ...editing.values,
        description: editing.values.description || null,
        image_url: editing.values.image_url || null,
      };
      await upsertFn({ data: { id: editing.id, values } });
      toast.success(editing.id ? "Venue updated" : "Venue created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-venues"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Deactivate this venue?")) return;
    try {
      await delFn({ data: { id } });
      toast.success("Venue deactivated");
      qc.invalidateQueries({ queryKey: ["admin-venues"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Venues</h1>
          <p className="mt-1 text-sm text-muted-foreground">{venues?.length ?? 0} venues</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" /> Add venue</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit venue" : "New venue"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="grid gap-4 py-2">
                <Field label="Name"><Input value={editing.values.name} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, name: e.target.value } })} /></Field>
                <Field label="Slug (URL)"><Input value={editing.values.slug} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, slug: e.target.value } })} placeholder="lowercase-hyphen" /></Field>
                <Field label="Sport">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-input px-3 text-sm"
                    value={editing.values.sport_id}
                    onChange={(e) => setEditing({ ...editing, values: { ...editing.values, sport_id: e.target.value } })}
                  >
                    {sports?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City"><Input value={editing.values.city} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, city: e.target.value } })} /></Field>
                  <Field label="Price / hour (₹)"><Input type="number" value={editing.values.price_per_hour} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, price_per_hour: Number(e.target.value) } })} /></Field>
                </div>
                <Field label="Address"><Input value={editing.values.address} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, address: e.target.value } })} /></Field>
                <Field label="Image URL"><Input value={editing.values.image_url ?? ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, image_url: e.target.value } })} placeholder="https://…" /></Field>
                <Field label="Description"><Textarea rows={3} value={editing.values.description ?? ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, description: e.target.value } })} /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Opens (0-23)"><Input type="number" min={0} max={23} value={editing.values.opening_hour} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, opening_hour: Number(e.target.value) } })} /></Field>
                  <Field label="Closes (1-24)"><Input type="number" min={1} max={24} value={editing.values.closing_hour} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, closing_hour: Number(e.target.value) } })} /></Field>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.values.is_active} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, is_active: e.target.checked } })} />
                  Active
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={onSave}>Save</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Sport</th>
                <th className="pb-2 font-medium">City</th>
                <th className="pb-2 font-medium text-right">₹/hr</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(venues ?? []).map((v: any) => (
                <tr key={v.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-medium">{v.name}</td>
                  <td className="py-3 text-muted-foreground">{v.sport?.name}</td>
                  <td className="py-3 text-muted-foreground">{v.city}</td>
                  <td className="py-3 text-right">{v.price_per_hour}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.is_active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{v.is_active ? "active" : "inactive"}</span>
                  </td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                    {v.is_active && <Button size="sm" variant="ghost" onClick={() => onDelete(v.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                  </td>
                </tr>
              ))}
              {!isLoading && (venues ?? []).length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">No venues yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}