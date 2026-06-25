/**
 * Upload Yorker Yard 360 turf media (3 photos + 1 video) and link on the venue.
 *
 * Usage (from repo root):
 *   set -a && source .env && set +a && node scripts/upload-yorker-yard-360-media.mjs
 *
 * MySQL: uses VENUE_MEDIA_* env vars. On Hostinger server use 127.0.0.1.
 * From your laptop use the remote MySQL hostname from hPanel (not 127.0.0.1).
 *
 * Fallback: if MySQL is unreachable, files are copied to public/venues/yorker-yard-oval-360/
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const VENUE_SLUG = "yorker-yard-360";
const PUBLIC_DIR = path.join(ROOT, "public", "venues", "yorker-yard-360");

const ASSETS = [
  {
    source: "Turf_Media/Yorker_Yard_360/TopView.PNG",
    publicName: "top-view.png",
    category: "venues",
    mime: "image/png",
    type: "image",
    label: "Top view",
  },
  {
    source: "Turf_Media/Yorker_Yard_360/SideView.PNG",
    publicName: "side-view.png",
    category: "venues",
    mime: "image/png",
    type: "image",
    label: "Side view",
  },
  {
    source: "Turf_Media/Yorker_Yard_360/SideView2.PNG",
    publicName: "side-view-2.png",
    category: "venues",
    mime: "image/png",
    type: "image",
    label: "Side view 2",
  },
  {
    source: "Turf_Media/Yorker_Yard_360/1782324106806261.mp4",
    publicName: "turf-tour.mp4",
    category: "videos",
    mime: "video/mp4",
    type: "video",
    label: "Turf tour",
  },
];

function hasVenueMysql() {
  return Boolean(
    process.env.VENUE_MEDIA_DATABASE_URL ||
      (process.env.VENUE_MEDIA_HOST &&
        process.env.VENUE_MEDIA_USER &&
        process.env.VENUE_MEDIA_PASSWORD &&
        process.env.VENUE_MEDIA_DATABASE),
  );
}

function createVenuePool() {
  if (process.env.VENUE_MEDIA_DATABASE_URL) {
    return mysql.createPool({
      uri: process.env.VENUE_MEDIA_DATABASE_URL,
      connectionLimit: 2,
      waitForConnections: true,
    });
  }
  return mysql.createPool({
    host: process.env.VENUE_MEDIA_HOST,
    port: Number(process.env.VENUE_MEDIA_PORT ?? 3306),
    user: process.env.VENUE_MEDIA_USER,
    password: process.env.VENUE_MEDIA_PASSWORD,
    database: process.env.VENUE_MEDIA_DATABASE,
    connectionLimit: 2,
    waitForConnections: true,
  });
}

async function saveToMysql(pool, ownerId, asset, buffer) {
  const id = crypto.randomUUID();
  await pool.execute(
    `INSERT INTO media_assets (id, user_id, category, mime_type, file_name, file_size, data)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, ownerId, asset.category, asset.mime, asset.publicName, buffer.length, buffer],
  );
  return `/api/media/venue/${id}`;
}

function saveToPublic(asset, buffer) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  const dest = path.join(PUBLIC_DIR, asset.publicName);
  fs.writeFileSync(dest, buffer);
  return `/venues/yorker-yard-360/${asset.publicName}`;
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: venue, error: venueErr } = await admin
    .from("venues")
    .select("id, slug, owner_id")
    .eq("slug", VENUE_SLUG)
    .maybeSingle();
  if (venueErr || !venue) throw new Error(`Venue not found: ${VENUE_SLUG}`);

  const ownerId = venue.owner_id;
  if (!ownerId) throw new Error("Venue has no owner_id");

  let pool = null;
  let mysqlOk = false;
  if (hasVenueMysql()) {
    try {
      pool = createVenuePool();
      await pool.query("SELECT 1");
      mysqlOk = true;
      console.log("MySQL venue media: connected");
    } catch (err) {
      console.warn("MySQL not reachable — using public/ folder fallback:", err.message);
      if (pool) await pool.end();
      pool = null;
    }
  } else {
    console.warn("VENUE_MEDIA_* not set — using public/ folder only");
  }

  const gallery = [];
  for (const asset of ASSETS) {
    const filePath = path.join(ROOT, asset.source);
    if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    let url;
    if (mysqlOk && pool) {
      try {
        url = await saveToMysql(pool, ownerId, asset, buffer);
        console.log("MySQL:", asset.publicName, "→", url);
      } catch (err) {
        console.warn(`MySQL insert failed for ${asset.publicName}, using public:`, err.message);
        url = saveToPublic(asset, buffer);
      }
    } else {
      url = saveToPublic(asset, buffer);
      console.log("Public:", asset.publicName, "→", url);
    }
    gallery.push({ type: asset.type, url, label: asset.label });
  }

  if (pool) await pool.end();

  const image_url = gallery.find((g) => g.type === "image")?.url ?? gallery[0]?.url;

  const patch = { image_url, media_gallery: gallery };
  const { error: updateErr } = await admin.from("venues").update(patch).eq("id", venue.id);
  if (updateErr?.message?.includes("media_gallery")) {
    console.warn("media_gallery column missing — run migration 20260625130000_venue_media_gallery.sql");
    const { error: imgErr } = await admin.from("venues").update({ image_url }).eq("id", venue.id);
    if (imgErr) throw new Error(imgErr.message);
  } else if (updateErr) {
    throw new Error(updateErr.message);
  }

  console.log("\nDone — Yorker Yard 360 media linked:");
  console.log("  image_url:", image_url);
  gallery.forEach((g, i) => console.log(`  ${i + 1}. [${g.type}] ${g.url}`));
  console.log("\nView: https://goodbookies.co.in/venues/" + VENUE_SLUG);
  if (!mysqlOk) {
    console.log("\nTip: Set VENUE_MEDIA_HOST to your Hostinger MySQL hostname and re-run to store blobs in MySQL.");
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
