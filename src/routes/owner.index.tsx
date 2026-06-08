import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ownerSummary, ownerRevenueSeries, ownerBookingsVolume, ownerListBookings } from "@/lib/owner.functions";
import { CalendarCheck, IndianRupee, Building2, Clock, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/owner/")({
  component: OwnerOverview,
});

function Kpi({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}

function OwnerOverview() {
  const [range, setRange] = useState(30);
  const sumFn = useServerFn(ownerSummary);
  const revFn = useServerFn(ownerRevenueSeries);
  const volFn = useServerFn(ownerBookingsVolume);
  const recentFn = useServerFn(ownerListBookings);

  const { data: sum } = useQuery({ queryKey: ["owner-sum"], queryFn: () => sumFn() });
  const { data: rev } = useQuery({ queryKey: ["owner-rev", range], queryFn: () => revFn({ data: { days: range } }) });
  const { data: vol } = useQuery({ queryKey: ["owner-vol", range], queryFn: () => volFn({ data: { days: range } }) });
  const { data: recent } = useQuery({ queryKey: ["owner-recent"], queryFn: () => recentFn({ data: { status: "all" } }) });

  const tip = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your venues at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi icon={CalendarCheck} label="Bookings today" value={sum?.bookingsToday ?? "N/A"} accent />
        <Kpi icon={IndianRupee} label="Revenue today" value={sum ? `₹${sum.revenueToday.toLocaleString()}` : "N/A"} accent />
        <Kpi icon={IndianRupee} label="Revenue this month" value={sum ? `₹${sum.revenueMonth.toLocaleString()}` : "N/A"} />
        <Kpi icon={Building2} label="Active venues" value={sum?.activeVenues ?? "N/A"} />
        <Kpi icon={Clock} label="Pending bookings" value={sum?.pendingBookings ?? "N/A"} />
        <Kpi icon={XCircle} label="Cancellations (mo)" value={sum?.cancelMonth ?? "N/A"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue" range={range} setRange={setRange}>
          <LineChart data={rev ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" fontSize={11} tickFormatter={(d) => d.slice(5)} stroke="var(--muted-foreground)" />
            <YAxis fontSize={11} stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={tip} formatter={(v: any) => [`₹${v}`, "Revenue"]} />
            <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ChartCard>
        <ChartCard title="Bookings" range={range} setRange={setRange}>
          <BarChart data={vol ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" fontSize={11} tickFormatter={(d) => d.slice(5)} stroke="var(--muted-foreground)" />
            <YAxis fontSize={11} stroke="var(--muted-foreground)" allowDecimals={false} />
            <Tooltip contentStyle={tip} />
            <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Recent bookings</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase text-muted-foreground">
                <th className="pb-2">User</th>
                <th className="pb-2">Venue</th>
                <th className="pb-2">Slot</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).slice(0, 8).map((b: any) => (
                <tr key={b.id} className="border-b border-border/30">
                  <td className="py-3">{b.profile?.full_name || b.profile?.email || "N/A"}</td>
                  <td className="py-3">{b.venue?.name}</td>
                  <td className="py-3 text-muted-foreground">{b.booking_date} · {b.start_hour}:00</td>
                  <td className="py-3 text-right font-semibold">₹{b.total_price}</td>
                  <td className="py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, range, setRange, children }: { title: string; range: number; setRange: (n: number) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setRange(d)} className={`rounded-md px-3 py-1 font-medium ${range === d ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{d}d</button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </div>
  );
}
