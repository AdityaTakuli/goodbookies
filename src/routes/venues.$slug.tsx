import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Clock, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { getVenue, getSlots, createBooking } from "@/lib/booking.functions";
import { SlotPicker } from "@/components/SlotPicker";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { resolveVenueImage } from "@/lib/images";

const venueQO = (slug: string) =>
  queryOptions({ queryKey: ["venue", slug], queryFn: () => getVenue({ data: { slug } }) });

export const Route = createFileRoute("/venues/$slug")({
  loader: async ({ context, params }) => {
    const v = await context.queryClient.ensureQueryData(venueQO(params.slug));
    if (!v) throw notFound();
  },
  component: VenuePage,
});

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function VenuePage() {
  const { slug } = Route.useParams();
  const { data: venue } = useSuspenseQuery(venueQO(slug));
  const { user } = useAuth();
  const navigate = useNavigate();
  const bookFn = useServerFn(createBooking);

  const [date, setDate] = useState(todayISO());
  const [selected, setSelected] = useState<number[]>([]);
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const slotsQuery = useQuery({
    queryKey: ["slots", venue!.id, date, playerCount],
    queryFn: () => getSlots({ data: { venueId: venue!.id, date, playerCount } }),
    refetchInterval: 5000,
  });

  if (!venue) return null;

  const sortedSel = [...selected].sort((a, b) => a - b);
  const isContiguous = sortedSel.every((h, i) => i === 0 || h === sortedSel[i - 1] + 1);
  const total = venue.price_per_hour * selected.length;
  const maxPlayersAllowed = Math.max(1, Number(venue.max_players_allowed ?? 1));
  const perPersonPrice = total > 0 ? Math.ceil(total / maxPlayersAllowed) : 0;
  const selectedSplitPrice = total > 0 ? Math.ceil(total / playerCount) : 0;
  const payableForSelectedPlayers = perPersonPrice * playerCount;
  const capacityPercent = Math.round((playerCount / maxPlayersAllowed) * 100);

  useEffect(() => {
    setPlayerNames((prev) => {
      const next = Array.from({ length: playerCount }, (_, i) => prev[i] ?? "");
      return next;
    });
  }, [playerCount]);

  useEffect(() => {
    const availableSet = new Set((slotsQuery.data ?? []).filter((s) => s.available).map((s) => s.hour));
    setSelected((prev) => prev.filter((h) => availableSet.has(h)));
  }, [slotsQuery.data]);

  const toggle = (h: number) => {
    setSelected((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]));
  };

  async function handleBook() {
    if (!user) {
      toast.info("Sign in to confirm your booking");
      navigate({ to: "/login", search: { redirect: `/venues/${slug}` } });
      return;
    }
    if (selected.length === 0) return;
    if (!isContiguous) {
      toast.error("Please select consecutive hours only");
      return;
    }
    const trimmedNames = playerNames.map((name) => name.trim());
    if (trimmedNames.some((name) => !name)) {
      toast.error("Please enter all player names");
      return;
    }
    const uniqueNames = new Set(trimmedNames.map((name) => name.toLowerCase()));
    if (uniqueNames.size !== trimmedNames.length) {
      toast.error("Each player name should be unique");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookFn({
        data: {
          venueId: venue!.id,
          date,
          startHour: sortedSel[0],
          endHour: sortedSel[sortedSel.length - 1] + 1,
          playerCount,
          playerNames: trimmedNames,
        },
      });
      navigate({ to: "/booking/success", search: { id: res.bookingId } });
    } catch (e: any) {
      toast.error(e.message ?? "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <img
              src={resolveVenueImage(venue.image_url)}
              alt={venue.name}
              width={1280}
              height={800}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="mt-6">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {venue.sport?.icon} {venue.sport?.name}
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold">{venue.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {venue.address}, {venue.city}</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /> {venue.rating}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {venue.opening_hour}:00 – {venue.closing_hour}:00</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">
              <IndianRupee className="mb-0.5 mr-1 inline h-4 w-4" />
              {venue.price_per_hour.toLocaleString()} per hour
            </p>
            {venue.description && <p className="mt-4 text-muted-foreground">{venue.description}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {venue.amenities?.map((a) => (
                <span key={a} className="rounded-full border border-border bg-card px-3 py-1 text-xs">{a}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <label className="text-sm font-semibold">Choose a date</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => { setDate(e.target.value); setSelected([]); }}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <label className="text-sm font-semibold">Players in this booking</label>
            <select
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {Array.from({ length: maxPlayersAllowed }, (_, i) => i + 1).map((count) => (
                <option key={count} value={count}>
                  {count} player{count === 1 ? "" : "s"}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              Max allowed on this turf: {maxPlayersAllowed}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Capacity filled: {playerCount}/{maxPlayersAllowed} ({capacityPercent}%)
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${capacityPercent}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <label className="text-sm font-semibold">Player names</label>
            <div className="mt-3 grid gap-2">
              {playerNames.map((name, idx) => (
                <input
                  key={idx}
                  value={name}
                  placeholder={`Player ${idx + 1} name`}
                  onChange={(e) =>
                    setPlayerNames((prev) => {
                      const next = [...prev];
                      next[idx] = e.target.value;
                      return next;
                    })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-display text-xl font-semibold">Available slots</h2>
            {slotsQuery.isLoading ? (
              <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">Loading the pitch…</div>
            ) : (
              <SlotPicker
                slots={slotsQuery.data ?? []}
                selected={selected}
                onToggle={toggle}
              />
            )}
          </div>

          <motion.div layout className="sticky bottom-4 rounded-2xl border border-primary/40 bg-card p-5 shadow-[var(--shadow-glow)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">You Pay (for {playerCount} players)</p>
                <p className="flex items-center font-display text-3xl font-bold">
                  <IndianRupee className="h-6 w-6" />{payableForSelectedPlayers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{selected.length} hour{selected.length === 1 ? "" : "s"} selected</p>
                <p className="text-xs text-muted-foreground">
                  Full booking total for turf: <IndianRupee className="mb-0.5 inline h-3 w-3" />{total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Per person (selected {playerCount}):{" "}
                  <IndianRupee className="mb-0.5 inline h-3 w-3" />
                  {selectedSplitPrice.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Split per person at full turf capacity ({maxPlayersAllowed}):{" "}
                  <IndianRupee className="mb-0.5 inline h-3 w-3" />
                  {perPersonPrice.toLocaleString()}
                </p>
              </div>
              <Button size="lg" disabled={selected.length === 0 || submitting} onClick={handleBook} className="glow-primary">
                {submitting ? "Booking…" : "Book Now"}
              </Button>
            </div>
            {selected.length > 0 && !isContiguous && (
              <p className="mt-3 text-xs text-destructive">Pick consecutive hours to book a continuous slot.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}