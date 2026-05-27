import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListOwnerRequests, adminReviewOwnerRequest } from "@/lib/owner.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/owner-requests")({
  component: AdminOwnerRequests,
});

function AdminOwnerRequests() {
  const listFn = useServerFn(adminListOwnerRequests);
  const reviewFn = useServerFn(adminReviewOwnerRequest);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-owner-req"], queryFn: () => listFn() });

  const review = async (id: string, action: "approve" | "reject") => {
    let reason: string | undefined;
    if (action === "reject") {
      reason = prompt("Rejection reason:") ?? "Not approved";
      if (!reason) return;
    }
    try {
      await reviewFn({ data: { id, action, reason } });
      toast.success(action === "approve" ? "Owner approved" : "Owner rejected");
      qc.invalidateQueries({ queryKey: ["admin-owner-req"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Owner requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pending venue partner applications.</p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Phone</th>
                <th className="pb-2 font-medium">Business</th>
                <th className="pb-2 font-medium">City</th>
                <th className="pb-2 font-medium">Submitted</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((o: any) => (
                <tr key={o.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-medium">{o.name}</td>
                  <td className="py-3">{o.email}</td>
                  <td className="py-3">{o.phone}</td>
                  <td className="py-3">{o.business_name || "—"}</td>
                  <td className="py-3">{o.city}</td>
                  <td className="py-3 text-muted-foreground">{o.created_at?.slice(0, 10)}</td>
                  <td className="py-3 text-right space-x-2">
                    <Button size="sm" onClick={() => review(o.id, "approve")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => review(o.id, "reject")}>Reject</Button>
                  </td>
                </tr>
              ))}
              {!isLoading && (data ?? []).length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">No pending requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
