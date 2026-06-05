#!/usr/bin/env bash
# Apply venue reviews migration to Supabase Postgres.
#
# Option A — Supabase Dashboard (easiest):
#   1. Open https://supabase.com/dashboard/project/gbjsdtzcawmfiqwbmmip/sql/new
#   2. Paste the contents of supabase/migrations/20260604120000_venue_reviews.sql
#   3. Click Run
#
# Option B — psql (if you have the database password):
#   export SUPABASE_DB_PASSWORD='your-db-password'
#   ./scripts/apply-venue-reviews-migration.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATION="$ROOT/supabase/migrations/20260604120000_venue_reviews.sql"
PROJECT_REF="gbjsdtzcawmfiqwbmmip"

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Paste this SQL in Supabase SQL Editor:"
  echo "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
  echo ""
  cat "$MIGRATION"
  exit 0
fi

DB_URL="postgresql://postgres.${PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
psql "$DB_URL" -f "$MIGRATION"
echo "Migration applied."
