import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { adminSummary, adminRevenueSeries, adminBookingsBySport, adminTopVenues, adminListBookings, adminBookingsVolume } from "@/lib/admin.functions";
import { CalendarCheck, IndianRupee, Building2, UserPlus, XCircle, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

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

function AdminOverview() {
  const [range, setRange] = useState(30);
  const sumFn = useServerFn(adminSummary);
  const revFn = useServerFn(adminRevenueSeries);
  const pieFn = useServerFn(adminBookingsBySport);
  const topFn = useServerFn(adminTopVenues);
  const recentFn = useServerFn(adminListBookings);
  const volFn = useServerFn(adminBookingsVolume);

  const { data: sum } = useQuery({ queryKey: ["admin-sum"], queryFn: () => sumFn() });
  const { data: rev } = useQuery({ queryKey: ["admin-rev", range], queryFn: () => revFn({ data: { days: range } }) });
  const { data: volume } = useQuery({ queryKey: ["admin-vol", range], queryFn: () => volFn({ data: { days: range } }) });
  const { data: pie } = useQuery({ queryKey: ["admin-pie"], queryFn: () => pieFn() });
  const { data: top } = useQuery({ queryKey: ["admin-top"], queryFn: () => topFn() });
  const { data: recent } = useQuery({ queryKey: ["admin-recent"], queryFn: () => recentFn({ data: { limit: 10, status: "all" } }) });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform health at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi icon={CalendarCheck} label="Bookings today" value={sum?.bookingsToday ?? "—"} accent />
        <Kpi icon={IndianRupee} label="Revenue today" value={sum ? `₹${sum.revenueToday.toLocaleString()}` : "—"} accent />
        <Kpi icon={TrendingUp} label="Revenue this month" value={sum ? `₹${sum.revenueMonth.toLocaleString()}` : "—"} />
        <Kpi icon={Building2} label="Active venues" value={sum?.activeVenues ?? "—"} />
        <Kpi icon={UserPlus} label="New users (7d)" value={sum?.newUsersWeek ?? "—"} />
        <Kpi icon={XCircle} label="Cancellations (mo)" value={sum?.cancelMonth ?? "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Revenue</h2>
            <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setRange(d)}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${range === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rev ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: any) => [`₹${v}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Bookings by sport</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie ?? []} dataKey="count" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {(pie ?? []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Bookings volume</h2>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volume ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="count" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Top venues</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">Venue</th>
                <th className="pb-2 font-medium">Sport</th>
                <th className="pb-2 font-medium text-right">Bookings</th>
                <th className="pb-2 font-medium text-right">Revenue</th>
                <th className="pb-2 font-medium text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {(top ?? []).map((v, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0">
                  <td className="py-3 font-medium">{v.name}</td>
                  <td className="py-3 text-muted-foreground">{v.sport}</td>
                  <td className="py-3 text-right">{v.bookings}</td>
                  <td className="py-3 text-right font-semibold text-primary">₹{v.revenue.toLocaleString()}</td>
                  <td className="py-3 text-right">{v.rating.toFixed(1)}</td>
                </tr>
              ))}
              {(!top || top.length === 0) && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Recent bookings</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Venue</th>
                <th className="pb-2 font-medium">Slot</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recent ?? []).slice(0, 10).map((b: any) => (
                <tr key={b.id} className="border-b border-border/30 last:border-0">
                  <td className="py-3">{b.profile?.full_name || b.profile?.email || "—"}</td>
                  <td className="py-3">{b.venue?.name}</td>
                  <td className="py-3 text-muted-foreground">{b.booking_date} · {b.start_hour}:00–{b.end_hour}:00</td>
                  <td className="py-3 text-right font-semibold">₹{b.total_price}</td>
                  <td className="py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {(!recent || recent.length === 0) && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
