import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListVenueApprovals, adminReviewVenue } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/venue-approvals")({
  component: AdminVenueApprovals,
});

function AdminVenueApprovals() {
  const listFn = useServerFn(adminListVenueApprovals);
  const reviewFn = useServerFn(adminReviewVenue);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-venue-approvals"], queryFn: () => listFn() });

  const review = async (id: string, action: "approve" | "reject") => {
    let reason: string | undefined;
    if (action === "reject") reason = prompt("Rejection reason:") ?? undefined;
    try {
      await reviewFn({ data: { id, action, reason } });
      toast.success(action === "approve" ? "Venue live" : "Venue rejected");
      qc.invalidateQueries({ queryKey: ["admin-venue-approvals"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Venue approvals</h1>
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="space-y-4">
          {(data ?? []).map((v: any) => (
            <div key={v.id} className="flex flex-wrap justify-between gap-3 border-b border-border/40 pb-4">
              <div>
                <p className="font-semibold">{v.name}</p>
                <p className="text-sm text-muted-foreground">{v.sport?.name} · {v.city} · ₹{v.price_per_hour}/hr</p>
                <p className="text-xs text-muted-foreground">Owner: {(v.owner as any)?.name} ({(v.owner as any)?.email})</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => review(v.id, "approve")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => review(v.id, "reject")}>Reject</Button>
              </div>
            </div>
          ))}
          {!isLoading && (data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No pending venues.</p>}
        </div>
      </div>
    </div>
  );
}
