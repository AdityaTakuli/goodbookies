import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListOwners, adminUpdateOwner } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/owners")({
  component: AdminOwners,
});

function AdminOwners() {
  const listFn = useServerFn(adminListOwners);
  const updateFn = useServerFn(adminUpdateOwner);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-owners"], queryFn: () => listFn() });
  const [commissionEdit, setCommissionEdit] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Owners</h1>
      <div className="rounded-2xl border border-border/60 bg-card p-5 overflow-x-auto">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase text-muted-foreground">
              <th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">City</th>
              <th className="pb-2">Venues</th><th className="pb-2">Status</th><th className="pb-2">Commission %</th><th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((o: any) => (
              <tr key={o.id} className="border-b border-border/30">
                <td className="py-3 font-medium">{o.name}</td>
                <td className="py-3">{o.email}</td>
                <td className="py-3">{o.city}</td>
                <td className="py-3">{o.venueCount}</td>
                <td className="py-3 capitalize">{o.status}</td>
                <td className="py-3">
                  <Input
                    className="w-20 h-8"
                    placeholder={o.platform_commission_override ?? "default"}
                    value={commissionEdit[o.id] ?? ""}
                    onChange={(e) => setCommissionEdit({ ...commissionEdit, [o.id]: e.target.value })}
                  />
                </td>
                <td className="py-3 text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={async () => {
                    const v = commissionEdit[o.id];
                    await updateFn({ data: { id: o.id, platform_commission_override: v ? Number(v) : null } });
                    toast.success("Commission updated");
                    qc.invalidateQueries({ queryKey: ["admin-owners"] });
                  }}>Set %</Button>
                  {o.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={async () => {
                      await updateFn({ data: { id: o.id, status: "suspended" } });
                      toast.success("Suspended");
                      qc.invalidateQueries({ queryKey: ["admin-owners"] });
                    }}>Suspend</Button>
                  )}
                  {o.status === "suspended" && (
                    <Button size="sm" onClick={async () => {
                      await updateFn({ data: { id: o.id, status: "approved" } });
                      toast.success("Reactivated");
                      qc.invalidateQueries({ queryKey: ["admin-owners"] });
                    }}>Unsuspend</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
