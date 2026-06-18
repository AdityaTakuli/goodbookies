import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Clock, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { getVenue, getSlots, createBooking } from "@/lib/booking.functions";
import { SlotPicker } from "@/components/SlotPicker";
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
import { computeBookingCharge, INDIVIDUAL_BOOKING_SURCHARGE, resolvePayableAmount, type FullTurfPaymentPlan } from "@/lib/pricing";
import {
  bookingDurationHours,
  formatMinBookingDuration,
  isContiguousSlots,
  selectionEndFromSlots,
  slotPriceTotal,
  slotStepMinutes,
} from "@/lib/slot-time";

type BookingMode = "individual" | "full";

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
  const [bookingMode, setBookingMode] = useState<BookingMode>("individual");
  const [paymentPlan, setPaymentPlan] = useState<FullTurfPaymentPlan>("full");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{
    bookingId: string;
    orderId: string;
    amountPaise: number;
    customerName: string;
  } | null>(null);

  const maxPlayersAllowed = Math.max(1, Number(rawVenue?.max_players_allowed ?? 1));
  const playerCount = bookingMode === "full" ? maxPlayersAllowed : 1;

  const slotsQuery = useQuery({
    queryKey: ["slots", rawVenue?.id, date, playerCount],
    queryFn: () => getSlots({ data: { venueId: rawVenue!.id, date, playerCount } }),
    enabled: Boolean(rawVenue?.id),
    refetchInterval: 15000,
  });

  const slotAvailabilityKey = useMemo(
    () =>
      (slotsQuery.data ?? [])
        .map((s) => `${s.startMinute}:${s.available ? 1 : 0}`)
        .join(","),
    [slotsQuery.data],
  );

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
  const selectedDurationMinutes = sortedSel.length
    ? sortedSel[sortedSel.length - 1] + stepMinutes - sortedSel[0]
    : 0;
  const selectedHours = bookingDurationHours(selectedDurationMinutes);
  const showBookingModeChoice = maxPlayersAllowed > 1;
  const slotByMinute = new Map((slotsQuery.data ?? []).map((s) => [s.startMinute, s]));
  const minRemainingOnSelection = sortedSel.length
    ? Math.min(...sortedSel.map((m) => slotByMinute.get(m)?.remaining_capacity ?? maxPlayersAllowed))
    : maxPlayersAllowed;
  const alreadyBookedOnSelection = sortedSel.length
    ? Math.max(...sortedSel.map((m) => slotByMinute.get(m)?.booked_players ?? 0))
    : 0;
  const { charge: payableAmount, perPersonBase, isFullTurf } = computeBookingCharge(
    total,
    maxPlayersAllowed,
    playerCount,
  );
  const paymentQuote = resolvePayableAmount(total, maxPlayersAllowed, playerCount, paymentPlan);
  const displayPayable = paymentQuote.payable;
  const capacityAfterBooking = alreadyBookedOnSelection + playerCount;
  const capacityPercent = Math.round((capacityAfterBooking / maxPlayersAllowed) * 100);
  const canBookFullTurf = minRemainingOnSelection >= maxPlayersAllowed;
  const emptySpotsNow = (slotsQuery.data ?? []).reduce(
    (sum, slot) => sum + Math.max(0, Number(slot.remaining_capacity ?? 0)),
    0,
  );

  useEffect(() => {
    if (bookingMode === "full" && !canBookFullTurf) {
      setBookingMode("individual");
    }
  }, [canBookFullTurf, bookingMode]);

  useEffect(() => {
    setPaymentPlan("full");
    setTermsAccepted(false);
  }, [bookingMode]);

  useEffect(() => {
    const availableSet = new Set(
      (slotsQuery.data ?? []).filter((s) => s.available).map((s) => s.startMinute),
    );
    setSelected((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((m) => availableSet.has(m));
      return next.length === prev.length ? prev : next;
    });
  }, [slotAvailabilityKey, slotsQuery.data]);

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
    if (selectedDurationMinutes < minBookingMinutes) {
      toast.error(`Minimum booking is ${formatMinBookingDuration(minBookingMinutes)}`);
      return;
    }
    if (bookingMode === "full" && !canBookFullTurf) {
      toast.error("Full turf booking requires an empty slot");
      return;
    }
    if (!isFullTurf && !termsAccepted) {
      toast.error("Please accept the individual booking terms to continue");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookFn({
        data: {
          venueId: venue!.id,
          date,
          startMinute: sortedSel[0],
          endMinute: selectionEndFromSlots(sortedSel, stepMinutes) ?? sortedSel[0] + stepMinutes,
          playerCount,
          paymentPlan: isFullTurf ? paymentPlan : "full",
        },
      });

      if (res.requiresPayment && res.razorpayOrderId && res.amountPaise >= 100) {
        const customerName =
          session?.user?.user_metadata?.full_name ??
          session?.user?.email?.split("@")[0] ??
          "Player";
        setPendingCheckout({
          bookingId: res.bookingId,
          orderId: res.razorpayOrderId,
          amountPaise: res.amountPaise,
          customerName,
        });
        await qc.invalidateQueries({ queryKey: ["slots", venue!.id, date] });
        toast.message("Slot reserved", {
          description: "Click Open PayU below to pay and confirm.",
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
            <label className="text-sm font-semibold">Booking type</label>
            <p className="mt-1 text-xs text-muted-foreground">
              Book one spot for yourself, or reserve the entire turf. Each player must book their own
              individual spot — one booking cannot cover multiple players.
            </p>
            {showBookingModeChoice ? (
              <div className="mt-3 grid gap-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    bookingMode === "individual" ? "border-primary bg-primary/5" : "border-border/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="bookingMode"
                    checked={bookingMode === "individual"}
                    onChange={() => setBookingMode("individual")}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <span className="font-semibold">Individual spot</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      One spot for you only · includes {Math.round(INDIVIDUAL_BOOKING_SURCHARGE * 100)}% service fee
                      {selected.length > 0 && (
                        <>
                          {" "}
                          ·{" "}
                          <IndianRupee className="mb-0.5 inline h-3 w-3" />
                          {payableAmount.toLocaleString()}
                        </>
                      )}
                    </span>
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    bookingMode === "full" ? "border-primary bg-primary/5" : "border-border/60"
                  } ${!canBookFullTurf && sortedSel.length > 0 ? "opacity-60" : ""}`}
                >
                  <input
                    type="radio"
                    name="bookingMode"
                    checked={bookingMode === "full"}
                    onChange={() => setBookingMode("full")}
                    disabled={sortedSel.length > 0 && !canBookFullTurf}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    <span className="font-semibold">Full turf</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      Private group booking
                      {selected.length > 0 && (
                        <>
                          {" "}
                          ·{" "}
                          <IndianRupee className="mb-0.5 inline h-3 w-3" />
                          {total.toLocaleString()}
                        </>
                      )}
                    </span>
                    {sortedSel.length > 0 && !canBookFullTurf && (
                      <span className="mt-1 block text-xs text-destructive">
                        Selected slot is not fully empty — choose another slot or book individual spots.
                      </span>
                    )}
                  </span>
                </label>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                This turf holds one player per slot.
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Turf capacity: {maxPlayersAllowed} player{maxPlayersAllowed === 1 ? "" : "s"}
              {sortedSel.length > 0 && ` · ${minRemainingOnSelection} spot${minRemainingOnSelection === 1 ? "" : "s"} left on selected slot`}
            </p>
            {sortedSel.length > 0 && (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  {alreadyBookedOnSelection} booked + {playerCount} yours = {capacityAfterBooking}/{maxPlayersAllowed}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${capacityPercent}%` }} />
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="mb-1 font-display text-xl font-semibold">Available slots</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Live empty spots left today: {emptySpotsNow}
              {minSlotCount > 1 && (
                <> · Min booking: {formatMinBookingDuration(minBookingMinutes)} — select a continuous range</>
              )}
            </p>
            {slotsQuery.isLoading ? (
              <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-muted-foreground">Loading the pitch…</div>
            ) : (
              <SlotPicker
                key={`${date}-${bookingMode}`}
                slots={slotsQuery.data ?? []}
                selected={selected}
                stepMinutes={stepMinutes}
                minBookingMinutes={minBookingMinutes}
                onChange={setSelected}
              />
            )}
          </div>

          {isOwnVenue ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
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
            <div className="space-y-3">
              <BookingPaymentPortal
                amount={displayPayable}
                fullAmount={payableAmount}
                balanceDue={paymentQuote.balanceDue}
                bookingLabel={isFullTurf ? "Full turf" : "Individual spot"}
                hours={selectedHours}
                venueName={venue.name}
                isIndividual={!isFullTurf}
                isFullTurf={isFullTurf}
                paymentPlan={paymentPlan}
                onPaymentPlanChange={setPaymentPlan}
                termsAccepted={termsAccepted}
                onTermsAcceptedChange={setTermsAccepted}
                disabled={selected.length === 0}
                loading={submitting || paying}
                requiresPayment={displayPayable >= 1}
                awaitingCheckout={Boolean(pendingCheckout)}
                onPay={handleBook}
                onOpenCheckout={handleOpenPayment}
              />
              {selected.length > 0 && showBookingModeChoice && (
                <div className="rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-xs text-muted-foreground">
                  <p>
                    Full turf: <IndianRupee className="mb-0.5 inline h-3 w-3" />
                    {total.toLocaleString()} · Individual base share:{" "}
                    <IndianRupee className="mb-0.5 inline h-3 w-3" />
                    {perPersonBase.toLocaleString()} + {Math.round(INDIVIDUAL_BOOKING_SURCHARGE * 100)}% fee
                  </p>
                </div>
              )}
              {selected.length > 0 && !isContiguous && (
                <p className="text-xs text-destructive">Pick consecutive slots to book a continuous window.</p>
              )}
              {selected.length > 0 && isContiguous && selectedDurationMinutes < minBookingMinutes && (
                <p className="text-xs text-destructive">
                  Select at least {formatMinBookingDuration(minBookingMinutes)}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <VenueReviews venueId={venue.id} venueName={venue.name} />
    </div>
  );
}