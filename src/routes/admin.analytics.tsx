import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from "recharts";
import { Trophy } from "lucide-react";
import {
  adminMonthlyRevenue, adminUserGrowth, adminCancellationTrend, adminRevenueByVenue, adminExportAnalyticsCsv,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const monthlyFn = useServerFn(adminMonthlyRevenue);
  const growthFn = useServerFn(adminUserGrowth);
  const cancelFn = useServerFn(adminCancellationTrend);
  const venueFn = useServerFn(adminRevenueByVenue);
  const exportFn = useServerFn(adminExportAnalyticsCsv);

  const { data: monthly } = useQuery({ queryKey: ["admin-monthly-rev"], queryFn: () => monthlyFn() });
  const { data: growth } = useQuery({ queryKey: ["admin-user-growth"], queryFn: () => growthFn({ data: { days: 90 } }) });
  const { data: cancellations } = useQuery({ queryKey: ["admin-cancel-trend"], queryFn: () => cancelFn({ data: { days: 30 } }) });
  const { data: byVenue } = useQuery({ queryKey: ["admin-rev-venue"], queryFn: () => venueFn() });

  const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Deep-dive platform metrics.</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => {
          const { csv, filename } = await exportFn();
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
          a.download = filename;
          a.click();
        }}>Export CSV</Button>
      </div>

      {monthly?.bestMonth && monthly.bestMonth.revenue > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sale of the month</p>
            <p className="font-display text-xl font-bold">
              {monthly.bestMonth.label}: ₹{monthly.bestMonth.revenue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Monthly revenue ({new Date().getFullYear()})</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly?.months ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`₹${v}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="font-display text-lg font-semibold">User growth (90d)</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Cancellation rate (30d)</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cancellations ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, "Rate"]} />
                <Line type="monotone" dataKey="rate" stroke="var(--destructive)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Revenue by venue</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(byVenue ?? []).slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis type="category" dataKey="name" width={120} stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`₹${v}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
