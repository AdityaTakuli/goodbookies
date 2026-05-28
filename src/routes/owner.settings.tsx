import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getOwnerStatus, ownerUpdateProfile } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/settings")({
  component: OwnerSettings,
});

function OwnerSettings() {
  const getFn = useServerFn(getOwnerStatus);
  const saveFn = useServerFn(ownerUpdateProfile);
  const qc = useQueryClient();
  const { data: owner } = useQuery({ queryKey: ["owner-status"], queryFn: () => getFn() });
  const [form, setForm] = useState({ name: "", phone: "", business_name: "" });

  useEffect(() => {
    if (owner) setForm({ name: owner.name ?? "", phone: owner.phone ?? "", business_name: owner.business_name ?? "" });
  }, [owner]);

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
        <div><Label>Email</Label><Input value={owner?.email ?? ""} disabled /></div>
        <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div><Label>Business name</Label><Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} /></div>
        <Button onClick={async () => {
          try {
            await saveFn({ data: form });
            toast.success("Profile updated");
            qc.invalidateQueries({ queryKey: ["owner-status"] });
          } catch (e: any) { toast.error(e.message); }
        }}>Save</Button>
      </div>
    </div>
  );
}
