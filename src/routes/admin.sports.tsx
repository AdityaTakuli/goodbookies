import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListSports, adminUpsertSport } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sports")({
  component: AdminSports,
});

type SportValues = { name: string; slug: string; icon?: string | null; is_active: boolean };

function AdminSports() {
  const listFn = useServerFn(adminListSports);
  const upsertFn = useServerFn(adminUpsertSport);
  const qc = useQueryClient();
  const { data: sports, isLoading } = useQuery({ queryKey: ["admin-sports-all"], queryFn: () => listFn() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: string; values: SportValues } | null>(null);

  const save = async () => {
    if (!editing) return;
    try {
      await upsertFn({ data: { id: editing.id, values: { ...editing.values, icon: editing.values.icon || null } } });
      toast.success("Saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-sports-all"] });
      qc.invalidateQueries({ queryKey: ["admin-sports"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Sports</h1>
          <p className="mt-1 text-sm text-muted-foreground">{sports?.length ?? 0} sports</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing({ values: { name: "", slug: "", icon: "", is_active: true } }); setOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" /> Add sport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Edit sport" : "New sport"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="grid gap-4 py-2">
                <div className="grid gap-1.5"><Label>Name</Label><Input value={editing.values.name} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, name: e.target.value } })} /></div>
                <div className="grid gap-1.5"><Label>Slug</Label><Input value={editing.values.slug} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, slug: e.target.value } })} /></div>
                <div className="grid gap-1.5"><Label>Icon (emoji)</Label><Input value={editing.values.icon ?? ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, icon: e.target.value } })} /></div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.values.is_active} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, is_active: e.target.checked } })} />
                  Active
                </label>
                <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(sports ?? []).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-xl">{s.icon || "🏟️"}</span>
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.slug}{!s.is_active && " · inactive"}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditing({ id: s.id, values: { name: s.name, slug: s.slug, icon: s.icon, is_active: s.is_active } }); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}