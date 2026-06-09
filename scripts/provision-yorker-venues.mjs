/**
 * Onboard Yorker Yard turfs for palanuragpal94@gmail.com
 * Usage: set -a && source .env && set +a && node scripts/provision-yorker-venues.mjs
 */
import { createClient } from "@supabase/supabase-js";

const OWNER_EMAIL = "palanuragpal94@gmail.com";
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1531416517826-7fa583ad264d?w=1200&q=80";

const INSTAGRAM = "https://www.instagram.com/yorker_yard__the_turf?igsh=eHY4djg0eWduaDh0";
const MAPS = "https://maps.app.goo.gl/vVjrCR1oKQUhu4ks6";

function venueDescription({ shape, areaSqFt }) {
  return [
    `Yorker Yard turf · ${shape} · ${areaSqFt.toLocaleString()} sq ft`,
    "Ideal capacity: 20 players · Cricket equipment on site",
    "Owner: Anurag Pal · Phone: +91 9548987966",
    `Instagram: ${INSTAGRAM}`,
    `Location: ${MAPS}`,
    "Open 24 hours · Min booking: 60 minutes",
  ].join("\n");
}

const TURFS = [
  {
    name: "Yorker Yard Rectangular",
    slug: "yorker-yard-rectangular",
    price_per_hour: 600,
    venue_type: "rectangle",
    max_players_allowed: 20,
    description: venueDescription({ shape: "Rectangle", areaSqFt: 7000 }),
  },
  {
    name: "Yorker Yard OVAL 360",
    slug: "yorker-yard-oval-360",
    price_per_hour: 700,
    venue_type: "circular",
    max_players_allowed: 20,
    description: venueDescription({ shape: "Circular (OVAL 360)", areaSqFt: 15600 }),
  },
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) throw new Error(listErr.message);

  const user = list.users.find((u) => u.email?.toLowerCase() === OWNER_EMAIL);
  if (!user) throw new Error(`No auth user for ${OWNER_EMAIL}. Run provision-owner.mjs first.`);

  const ownerId = user.id;

  await admin
    .from("owners")
    .update({
      name: "Anurag Pal",
      business_name: "Yorker yard turf",
      phone: "+919548987966",
      city: "Jhelum",
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", ownerId);

  const { data: sport, error: sportErr } = await admin
    .from("sports")
    .select("id")
    .eq("slug", "cricket")
    .maybeSingle();
  if (sportErr || !sport?.id) throw new Error("Cricket sport not found in database");

  for (const turf of TURFS) {
    const { data: existing } = await admin.from("venues").select("id, slug").eq("slug", turf.slug).maybeSingle();

    const payload = {
      owner_id: ownerId,
      sport_id: sport.id,
      name: turf.name,
      slug: turf.slug,
      description: turf.description,
      address: "Madhavan colony, Maplewood school",
      city: "Jhelum",
      image_url: PLACEHOLDER_IMAGE,
      price_per_hour: turf.price_per_hour,
      opening_hour: 0,
      closing_hour: 24,
      slot_duration_minutes: 60,
      max_players_allowed: turf.max_players_allowed,
      venue_type: turf.venue_type,
      amenities: ["Cricket", "Cricket equipment", "Floodlights"],
      operating_days: [0, 1, 2, 3, 4, 5, 6],
      advance_booking_days: 30,
      confirmation_mode: "instant",
      approval_status: "approved",
      is_active: true,
      rejection_reason: null,
    };

    if (existing) {
      const { error } = await admin.from("venues").update(payload).eq("id", existing.id);
      if (error) throw new Error(`Update ${turf.slug}: ${error.message}`);
      console.log("Updated:", turf.name, existing.id);
    } else {
      const { data: row, error } = await admin.from("venues").insert(payload).select("id").single();
      if (error) throw new Error(`Insert ${turf.slug}: ${error.message}`);
      console.log("Created:", turf.name, row.id);
    }
  }

  console.log("\n--- Yorker Yard turfs live ---");
  console.log("Owner:", OWNER_EMAIL);
  console.log("Venues:");
  for (const t of TURFS) {
    console.log(`  • ${t.name} — ₹${t.price_per_hour}/hr — /venues/${t.slug}`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
