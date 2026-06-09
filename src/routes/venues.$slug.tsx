import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Clock, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { getVenue, getSlots, createBooking } from "@/lib/booking.functions";
import { SlotPicker } from "@/components/SlotPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { resolveVenueImage } from "@/lib/images";
import { VenueReviews } from "@/components/VenueReviews";
import { VenueDetailSpecs, isOpen24Hours } from "@/components/VenueDetailSpecs";
import { BookingPaymentPortal } from "@/components/payments/BookingPaymentPortal";
import { useRazorpayCheckout } from "@/components/payments/useRazorpayCheckout";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMeta, breadcrumbJsonLd, sportsActivityVenueJsonLd } from "@/lib/seo";
import { resolveMediaUrlAbsolute } from "@/lib/media/urls";
import { withVenueExtras, resolveMinBookingMinutes } from "@/lib/venue-extras";
import {
  formatMinBookingDuration,
  isContiguousSlots,
  slotDurationHours,
  slotPriceTotal,
  slotStepMinutes,
} from "@/lib/slot-time";

const venueQO = (slug: string) =>
  queryOptions({ queryKey: ["venue", slug], queryFn: () => getVenue({ data: { slug } }) });

export const Route = createFileRoute("/venues/$slug")({
  loader: async ({ context, params }) => {
    const venue = await context.queryClient.ensureQueryData(venueQO(params.slug));
    if (!venue) throw notFound();
    return { venue };
  },
  head: ({ loaderData, params }) => {
    const venue = loaderData?.venue;
    if (!venue) {
      return buildPageMeta({ title: "Venue not found", path: `/venues/${params.slug}`, noIndex: true });
    }
    const sportName = venue.sport?.name ?? "Sports";
    const description =
      venue.description?.slice(0, 155) ||
      `Book ${venue.name} in ${venue.city}. ${sportName} turf from ₹${venue.price_per_hour}/hr. Live slots, instant confirmation on Good Bookies.`;
    const image = resolveMediaUrlAbsolute(venue.image_url);
    return buildPageMeta({
      title: `${venue.name} | ${sportName} in ${venue.city}`,
      description,
      path: `/venues/${venue.slug}`,
      image,
      imageAlt: `${venue.name}, ${sportName} turf in ${venue.city}`,
      type: "article",
    });
  },
  component: VenuePage,
});

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function VenuePage() {
  const { slug } = Route.useParams();
  const { data: rawVenue } = useSuspenseQuery(venueQO(slug));
  const venue = rawVenue ? withVenueExtras(rawVenue) : null;
  const { user, isOwner, session } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const bookFn = useServerFn(createBooking);
  const { openCheckout, paying } = useRazorpayCheckout();

  const [date, setDate] = useState(todayISO());
  const [selected, setSelected] = useState<number[]>([]);
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([""]);
  const [isOpenLobby, setIsOpenLobby] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{
    bookingId: string;
    orderId: string;
    amountPaise: number;
    customerName: string;
  } | null>(null);

  const slotsQuery = useQuery({
    queryKey: ["slots", venue!.id, date, playerCount],
    queryFn: () => getSlots({ data: { venueId: venue!.id, date, playerCount } }),
    refetchInterval: 5000,
  });

  if (!venue) return null;

  const open24 = isOpen24Hours(venue.opening_hour, venue.closing_hour);
  const hasStructuredDetails = Boolean(
    venue.area_sq_ft || venue.map_url || venue.venue_type || venue.water_available,
  );

  const isOwnVenue = Boolean(user && venue.owner_id && user.id === venue.owner_id);

  const stepMinutes = slotStepMinutes(venue.slot_duration_minutes);
  const minBookingMinutes = resolveMinBookingMinutes(venue);
  const minSlotCount = Math.max(1, Math.ceil(minBookingMinutes / stepMinutes));
  const sortedSel = [...selected].sort((a, b) => a - b);
  const isContiguous = isContiguousSlots(selected, stepMinutes);
  const total = slotPriceTotal(venue.price_per_hour, selected.length, stepMinutes);
  const selectedHours = slotDurationHours(selected.length, stepMinutes);
  const maxPlayersAllowed = Math.max(1, Number(venue.max_players_allowed ?? 1));
  const slotByMinute = new Map((slotsQuery.data ?? []).map((s) => [s.startMinute, s]));
  const minRemainingOnSelection = sortedSel.length
    ? Math.min(...sortedSel.map((m) => slotByMinute.get(m)?.remaining_capacity ?? maxPlayersAllowed))
    : maxPlayersAllowed;
  const maxSelectablePlayers = Math.max(1, Math.min(maxPlayersAllowed, minRemainingOnSelection));
  const alreadyBookedOnSelection = sortedSel.length
    ? Math.max(...sortedSel.map((m) => slotByMinute.get(m)?.booked_players ?? 0))
    : 0;
  const perPersonPrice = total > 0 ? Math.ceil(total / maxPlayersAllowed) : 0;
  const selectedSplitPrice = total > 0 ? Math.ceil(total / playerCount) : 0;
  const payableForSelectedPlayers = perPersonPrice * playerCount;
  const capacityAfterBooking = alreadyBookedOnSelection + playerCount;
  const capacityPercent = Math.round((capacityAfterBooking / maxPlayersAllowed) * 100);
  const emptySpotsNow = (slotsQuery.data ?? []).reduce(
    (sum, slot) => sum + Math.max(0, Number(slot.remaining_capacity ?? 0)),
    0,
  );

  useEffect(() => {
    setPlayerNames((prev) => {
      const next = Array.from({ length: playerCount }, (_, i) => prev[i] ?? "");
      return next;
    });
  }, [playerCount]);

  useEffect(() => {
    if (playerCount > maxSelectablePlayers) {
      setPlayerCount(maxSelectablePlayers);
    }
  }, [maxSelectablePlayers, playerCount]);

  useEffect(() => {
    const availableSet = new Set((slotsQuery.data ?? []).filter((s) => s.available).map((s) => s.startMinute));
    setSelected((prev) => prev.filter((m) => availableSet.has(m)));
  }, [slotsQuery.data]);

  const toggle = (m: number) => {
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  async function handleOpenPayment() {
    if (!pendingCheckout || !venue) return;
    const paid = await openCheckout({
      bookingId: pendingCheckout.bookingId,
      orderId: pendingCheckout.orderId,
      amountPaise: pendingCheckout.amountPaise,
      title: "Good Bookies",
      description: `${venue.name} · ${date}`,
      customerName: pendingCheckout.customerName,
      customerEmail: session?.user?.email ?? undefined,
    });
    if (paid) {
      const bookingId = pendingCheckout.bookingId;
      setPendingCheckout(null);
      await qc.invalidateQueries({ queryKey: ["slots", venue.id, date] });
      navigate({ to: "/booking/success", search: { id: bookingId } });
    }
  }

  async function handleBook() {
    if (!user) {
      toast.info("Sign in to confirm your booking");
      navigate({ to: "/login", search: { redirect: `/venues/${slug}` } });
      return;
    }
    if (selected.length === 0) return;
    if (!isContiguous) {
      toast.error("Please select consecutive slots only");
      return;
    }
    if (sortedSel.length < minSlotCount) {
      toast.error(`Minimum booking is ${formatMinBookingDuration(minBookingMinutes)}`);
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
          startMinute: sortedSel[0],
          endMinute: sortedSel[sortedSel.length - 1] + stepMinutes,
          playerCount,
          playerNames: trimmedNames,
          isOpenLobby: isOpenLobby && playerCount < maxPlayersAllowed,
        },
      });

      if (res.requiresPayment && res.razorpayOrderId && res.amountPaise >= 100) {
        setPendingCheckout({
          bookingId: res.bookingId,
          orderId: res.razorpayOrderId,
          amountPaise: res.amountPaise,
          customerName: trimmedNames[0],
        });
        await qc.invalidateQueries({ queryKey: ["slots", venue!.id, date] });
        toast.message("Slot reserved", {
          description: "Click Open Razorpay below to pay and confirm.",
        });
        return;
      }

      await qc.invalidateQueries({ queryKey: ["slots", venue!.id, date] });
      navigate({ to: "/booking/success", search: { id: res.bookingId } });
    } catch (e: any) {
      toast.error(e.message ?? "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Venues", path: "/sports" },
            { name: venue.name, path: `/venues/${venue.slug}` },
          ]),
          sportsActivityVenueJsonLd({
            ...venue,
            image_url: resolveMediaUrlAbsolute(venue.image_url),
          }),
        ]}
      />
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
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 shrink-0" />
                {venue.map_url ? (
                  <a
                    href={venue.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {venue.address}
                  </a>
                ) : (
                  venue.address
                )}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {venue.rating != null ? Number(venue.rating).toFixed(1) : "New"}
                {venue.review_count ? ` (${venue.review_count} reviews)` : ""}
              </span>
              {!open24 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {venue.opening_hour}:00 – {venue.closing_hour}:00
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">
              <IndianRupee className="mb-0.5 mr-1 inline h-4 w-4" />
              {venue.price_per_hour.toLocaleString()} per hour
            </p>
            <VenueDetailSpecs venue={venue} />
            {!hasStructuredDetails && venue.description && (
              <p className="mt-4 text-muted-foreground">{venue.description}</p>
            )}
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
              {Array.from({ length: maxSelectablePlayers }, (_, i) => i + 1).map((count) => (
                <option key={count} value={count}>
                  {count} player{count === 1 ? "" : "s"}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">
              Max allowed on this turf: {maxPlayersAllowed}
              {sortedSel.length > 0 && ` · ${minRemainingOnSelection} spot${minRemainingOnSelection === 1 ? "" : "s"} left on selected slot`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {sortedSel.length > 0
                ? `Capacity on selected slot: ${alreadyBookedOnSelection} booked + ${playerCount} yours = ${capacityAfterBooking}/${maxPlayersAllowed}`
                : `Select a time slot to see live capacity`}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${capacityPercent}%` }} />
            </div>
            {playerCount < maxPlayersAllowed && (
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3">
                <Checkbox
                  checked={isOpenLobby}
                  onCheckedChange={(v) => setIsOpenLobby(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-semibold">Open this match to the public</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    Let other players request to fill remaining spots on your slot.
                  </span>
                </span>
              </label>
            )}
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
            <h2 className="mb-1 font-display text-xl font-semibold">Available slots</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Live empty spots left today: {emptySpotsNow}
              {minSlotCount > 1 && (
                <> · Min booking: {formatMinBookingDuration(minBookingMinutes)}</>
              )}
            </p>
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

          {isOwnVenue ? (
            <div className="sticky bottom-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
              <p className="font-semibold text-foreground">This is your turf</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Partners cannot book their own venue. Manage slots and bookings from{" "}
                {isOwner ? (
                  <Link to="/owner" className="font-medium text-primary hover:underline">Partner dashboard</Link>
                ) : (
                  "Partner dashboard"
                )}
                , or book a different turf as a player.
              </p>
            </div>
          ) : (
            <motion.div layout className="sticky bottom-4 space-y-3">
              <BookingPaymentPortal
                amount={payableForSelectedPlayers}
                playerCount={playerCount}
                hours={selectedHours}
                venueName={venue.name}
                disabled={selected.length === 0}
                loading={submitting || paying}
                requiresPayment={payableForSelectedPlayers >= 1}
                awaitingCheckout={Boolean(pendingCheckout)}
                onPay={handleBook}
                onOpenCheckout={handleOpenPayment}
              />
              <div className="rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-xs text-muted-foreground">
                <p>
                  Full turf total: <IndianRupee className="mb-0.5 inline h-3 w-3" />
                  {total.toLocaleString()} · Per person ({playerCount} selected):{" "}
                  <IndianRupee className="mb-0.5 inline h-3 w-3" />
                  {selectedSplitPrice.toLocaleString()}
                </p>
              </div>
              {selected.length > 0 && !isContiguous && (
                <p className="text-xs text-destructive">Pick consecutive slots to book a continuous window.</p>
              )}
              {selected.length > 0 && isContiguous && sortedSel.length < minSlotCount && (
                <p className="text-xs text-destructive">
                  Select at least {formatMinBookingDuration(minBookingMinutes)} ({minSlotCount} slots).
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <VenueReviews venueId={venue.id} venueName={venue.name} />
    </div>
  );
}