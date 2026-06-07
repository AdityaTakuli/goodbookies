import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ownerListVenues, ownerUpsertVenue, ownerDeleteVenue } from "@/lib/owner.functions";
import { listSports } from "@/lib/booking.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaUploadField } from "@/components/media/MediaUploadField";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/venues")({
  component: OwnerVenues,
});

function OwnerVenues() {
  const listFn = useServerFn(ownerListVenues);
  const sportsFn = useServerFn(listSports);
  const upsertFn = useServerFn(ownerUpsertVenue);
  const delFn = useServerFn(ownerDeleteVenue);
  const qc = useQueryClient();
  const { data: venues, isLoading } = useQuery({ queryKey: ["owner-venues"], queryFn: () => listFn() });
  const { data: sports } = useQuery({ queryKey: ["sports-list"], queryFn: () => sportsFn() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    if (!editing || editing.values.sport_id || !sports?.length) return;
    setEditing((prev: any) =>
      prev ? { ...prev, values: { ...prev.values, sport_id: sports[0].id } } : prev,
    );
  }, [sports, editing]);

  const empty = () => ({
    name: "", slug: "", sport_id: sports?.[0]?.id ?? "", city: "", address: "",
    description: "", image_url: "", price_per_hour: 500, opening_hour: 6, closing_hour: 22,
    max_players_allowed: 10,
    confirmation_mode: "instant" as const, advance_booking_days: 30,
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
      description: editing.values.description?.trim() ? editing.values.description.trim() : null,
    };
    try {
      await upsertFn({ data: { id: editing.id, values } });
      toast.success(editing.id ? "Venue updated" : "Venue created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["owner-venues"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-bold">My venues</h1>
          <p className="mt-1 text-sm text-muted-foreground">{venues?.length ?? 0} listings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing({ values: empty() }); setOpen(true); }}><Plus className="mr-1 h-4 w-4" /> Add venue</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit venue" : "New venue"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="grid gap-3 py-2">
                <F label="Name"><Input value={editing.values.name} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, name: e.target.value } })} /></F>
                <F label="Slug"><Input value={editing.values.slug} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, slug: e.target.value } })} /></F>
                <F label="Sport">
                  <select className="h-10 w-full rounded-md border border-input bg-input px-3 text-sm" value={editing.values.sport_id} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, sport_id: e.target.value } })}>
                    <option value="" disabled>Select a sport</option>
                    {sports?.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </F>
                <div className="grid grid-cols-2 gap-3">
                  <F label="City"><Input value={editing.values.city} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, city: e.target.value } })} /></F>
                  <F label="₹/hr"><Input type="number" value={editing.values.price_per_hour} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, price_per_hour: Number(e.target.value) } })} /></F>
                </div>
                <F label="Max players allowed">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={editing.values.max_players_allowed ?? 10}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        values: { ...editing.values, max_players_allowed: Number(e.target.value) || 1 },
                      })
                    }
                  />
                </F>
                <F label="Address"><Input value={editing.values.address} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, address: e.target.value } })} /></F>
                <MediaUploadField
                  category="venues"
                  label="Turf photo"
                  hint="JPEG, PNG or WebP · max 5 MB · stored in venue MySQL (gb_venues)"
                  value={editing.values.image_url ?? null}
                  onChange={(path) => setEditing({ ...editing, values: { ...editing.values, image_url: path ?? "" } })}
                />
                <F label="Description"><Textarea rows={2} value={editing.values.description ?? ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, description: e.target.value } })} /></F>
                <F label="Confirmation">
                  <select className="h-10 w-full rounded-md border border-input bg-input px-3 text-sm" value={editing.values.confirmation_mode} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, confirmation_mode: e.target.value } })}>
                    <option value="instant">Instant confirm</option>
                    <option value="manual">Manual confirm</option>
                  </select>
                </F>
                <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {(venues ?? []).map((v: any) => (
            <div key={v.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.sport?.name} · {v.city} · ₹{v.price_per_hour}/hr</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${v.approval_status === "approved" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-400"}`}>{v.approval_status}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing({ id: v.id, values: { ...v, sport_id: v.sport_id, confirmation_mode: v.confirmation_mode ?? "instant" } }); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  {v.is_active && <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Deactivate?")) { await delFn({ data: { id: v.id } }); qc.invalidateQueries({ queryKey: ["owner-venues"] }); } }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1"><Label className="text-xs uppercase text-muted-foreground">{label}</Label>{children}</div>;
}
