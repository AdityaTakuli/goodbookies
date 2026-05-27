import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListPayments, adminPaymentsSummary } from "@/lib/admin.functions";
export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

function AdminPayments() {
  const [status, setStatus] = useState<"all" | "success" | "cancelled" | "pending">("all");
  const listFn = useServerFn(adminListPayments);
  const sumFn = useServerFn(adminPaymentsSummary);
  const { data: summary } = useQuery({ queryKey: ["admin-pay-sum"], queryFn: () => sumFn() });
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", status],
    queryFn: () => listFn({ data: { status } }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Payments & revenue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Transaction ledger (from bookings).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Collected (month)", value: summary?.collected },
          { label: "Refunded (month)", value: summary?.refunded },
          { label: "Net revenue", value: summary?.net, accent: true },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className={`mt-2 font-display text-2xl font-bold ${c.accent ? "text-primary" : ""}`}>
              {c.value != null ? `₹${c.value.toLocaleString()}` : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs w-fit">
        {(["all", "success", "cancelled", "pending"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-md px-3 py-1.5 font-medium capitalize transition-colors ${status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {s}
          </button>
        ))}
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
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Method</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-mono text-xs">{p.id.slice(0, 8)}</td>
                  <td className="py-3">{p.user}</td>
                  <td className="py-3">{p.venue}</td>
                  <td className="py-3 text-right font-semibold text-primary">₹{p.amount}</td>
                  <td className="py-3 text-muted-foreground">{p.method}</td>
                  <td className="py-3 capitalize">{p.status}</td>
                  <td className="py-3 text-muted-foreground">{p.date?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
