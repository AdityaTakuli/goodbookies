import { createFileRoute } from "@tanstack/react-router";
import { formatBookingSlotLabel } from "@/lib/slot-time";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ownerListBookings, ownerConfirmBooking, ownerRejectBooking } from "@/lib/owner.functions";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/owner/bookings")({
  component: OwnerBookings,
});

function OwnerBookings() {
  const [status, setStatus] = useState<"all" | "confirmed" | "cancelled" | "pending">("all");
  const listFn = useServerFn(ownerListBookings);
  const confirmFn = useServerFn(ownerConfirmBooking);
  const rejectFn = useServerFn(ownerRejectBooking);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["owner-bookings", status], queryFn: () => listFn({ data: { status } }) });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Bookings</h1>
      <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs w-fit">
        {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-md px-3 py-1.5 capitalize font-medium ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{s}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-5 overflow-x-auto">
        {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs uppercase text-muted-foreground">
              <th className="pb-2">User</th><th className="pb-2">Venue</th><th className="pb-2">Slot</th>
              <th className="pb-2 text-right">Amount</th><th className="pb-2">Status</th><th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((b: any) => (
              <tr key={b.id} className="border-b border-border/30">
                <td className="py-3">{b.profile?.full_name || b.profile?.phone || "N/A"}</td>
                <td className="py-3">{b.venue?.name}</td>
                <td className="py-3 text-muted-foreground">{b.booking_date} · {formatBookingSlotLabel(b)}</td>
                <td className="py-3 text-right font-semibold">₹{b.total_price}</td>
                <td className="py-3"><StatusBadge status={b.status} /></td>
                <td className="py-3 text-right space-x-1">
                  {b.status === "pending" && (
                    <>
                      <Button size="sm" onClick={async () => { await confirmFn({ data: { id: b.id } }); toast.success("Confirmed"); qc.invalidateQueries({ queryKey: ["owner-bookings"] }); }}>Confirm</Button>
                      <Button size="sm" variant="outline" onClick={async () => { await rejectFn({ data: { id: b.id } }); toast.success("Rejected"); qc.invalidateQueries({ queryKey: ["owner-bookings"] }); }}>Reject</Button>
                    </>
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
