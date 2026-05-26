import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { listMyBookings } from "@/lib/booking.functions";
import { useAuth } from "@/hooks/useAuth";
import { resolveVenueImage } from "@/lib/images";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const listFn = useServerFn(listMyBookings);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/dashboard" } });
  }, [loading, user, navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: () => listFn(),
    enabled: !!user,
  });

  if (loading || !user) return <div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl font-bold">My bookings</h1>
      <p className="mt-2 text-muted-foreground">{bookings?.length ?? 0} booking{(bookings?.length ?? 0) === 1 ? "" : "s"}</p>

      {isLoading && <div className="mt-10 text-muted-foreground">Loading…</div>}

      {!isLoading && bookings && bookings.length === 0 && (
        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-10 text-center">
          <p className="text-muted-foreground">No bookings yet.</p>
          <Link to="/sports"><Button className="mt-4">Book your first slot</Button></Link>
        </div>
      )}

      <div className="mt-10 grid gap-4">
        {bookings?.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center"
          >
            <img
              src={resolveVenueImage((b.venue as any)?.image_url)}
              alt=""
              loading="lazy"
              className="h-24 w-full rounded-lg object-cover sm:w-32"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{(b.venue as any)?.sport?.icon}</span>
                <h3 className="font-display text-lg font-semibold">{(b.venue as any)?.name}</h3>
              </div>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{(b.venue as any)?.city}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{b.booking_date} · {b.start_hour}:00 – {b.end_hour}:00</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold text-primary">₹{b.total_price}</p>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">{b.status}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}