import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyPayments } from "@/lib/account.functions";

export const Route = createFileRoute("/account/payments")({
  component: AccountPayments,
});

function AccountPayments() {
  const listFn = useServerFn(listMyPayments);
  const { data, isLoading } = useQuery({ queryKey: ["my-payments"], queryFn: () => listFn() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Payment history</h1>
        <p className="mt-1 text-sm text-muted-foreground">All charges for your bookings.</p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Booking</th>
                <th className="pb-2 font-medium">Venue</th>
                <th className="pb-2 font-medium">Sport</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.booking_id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-mono text-xs text-muted-foreground">{p.booking_id.slice(0, 8)}</td>
                  <td className="py-3">{p.venue}</td>
                  <td className="py-3 text-muted-foreground">{p.sport}</td>
                  <td className="py-3 text-muted-foreground">{p.date}</td>
                  <td className="py-3 text-right font-semibold">₹{p.amount}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status === "success" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && (data ?? []).length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">No payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
