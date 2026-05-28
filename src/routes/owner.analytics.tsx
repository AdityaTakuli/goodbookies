import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ownerRevenueSeries, ownerPeakHours, ownerExportAnalyticsCsv } from "@/lib/owner.functions";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/owner/analytics")({
  component: OwnerAnalytics,
});

function OwnerAnalytics() {
  const revFn = useServerFn(ownerRevenueSeries);
  const peakFn = useServerFn(ownerPeakHours);
  const exportFn = useServerFn(ownerExportAnalyticsCsv);
  const { data: rev } = useQuery({ queryKey: ["owner-an-rev"], queryFn: () => revFn({ data: { days: 90 } }) });
  const { data: peak } = useQuery({ queryKey: ["owner-peak"], queryFn: () => peakFn() });

  const maxCount = Math.max(1, ...(peak ?? []).map((p) => p.count));
  const tip = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 };

  const downloadCsv = async () => {
    const { csv, filename } = await exportFn();
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <Button variant="outline" size="sm" onClick={downloadCsv}>Export CSV</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Revenue (90 days)</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rev ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" fontSize={10} tickFormatter={(d) => d.slice(5)} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tip} formatter={(v: any) => [`₹${v}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold mb-4">Peak hours heatmap</h2>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(8, minmax(28px, 1fr))` }}>
            <div />
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
            ))}
            {[6, 8, 10, 12, 14, 16, 18, 20].flatMap((hour) => [
              <div key={`h-${hour}`} className="text-[10px] text-muted-foreground pr-1 flex items-center">{hour}:00</div>,
              ...[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const cell = peak?.find((p) => p.day === day && p.hour === hour);
                const intensity = (cell?.count ?? 0) / maxCount;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="h-7 rounded-sm"
                    style={{ background: `oklch(${0.35 + intensity * 0.35} 0.12 145)` }}
                    title={`${cell?.count ?? 0} bookings`}
                  />
                );
              }),
            ])}
          </div>
        </div>
      </div>
    </div>
  );
}
