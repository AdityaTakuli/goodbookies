import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListBookings, adminCancelBooking } from "@/lib/admin.functions";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

function AdminBookings() {
  const [status, setStatus] = useState<"all" | "confirmed" | "cancelled" | "pending">("all");
  const listFn = useServerFn(adminListBookings);
  const cancelFn = useServerFn(adminCancelBooking);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", status],
    queryFn: () => listFn({ data: { limit: 100, status } }),
  });

  const onCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelFn({ data: { id } });
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.length ?? 0} results</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
          {(["all", "confirmed", "cancelled", "pending"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1.5 font-medium capitalize transition-colors ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Venue</th>
                <th className="pb-2 font-medium">Sport</th>
                <th className="pb-2 font-medium">Slot</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((b: any) => (
                <tr key={b.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}</td>
                  <td className="py-3">{b.profile?.full_name || b.profile?.email || "—"}</td>
                  <td className="py-3">{b.venue?.name}</td>
                  <td className="py-3 text-muted-foreground">{b.venue?.sport?.name}</td>
                  <td className="py-3 text-muted-foreground">{b.booking_date} · {b.start_hour}:00–{b.end_hour}:00</td>
                  <td className="py-3 text-right font-semibold">₹{b.total_price}</td>
                  <td className="py-3"><StatusBadge status={b.status} /></td>
                  <td className="py-3 text-right">
                    {b.status === "confirmed" && (
                      <Button size="sm" variant="outline" onClick={() => onCancel(b.id)}>Cancel</Button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && (data ?? []).length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center text-sm text-muted-foreground">No bookings.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}