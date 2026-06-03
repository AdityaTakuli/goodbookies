#!/usr/bin/env bash
# Export remote Supabase schema to goodbookies/schema_dump.sql
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="${SUPABASE_PROJECT_REF:-gbjsdtzcawmfiqwbmmip}"
OUT_FILE="${1:-schema_dump.sql}"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required." >&2
  exit 1
fi

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "Not logged in. Run once in your terminal:"
  echo "  npx supabase login"
  echo "Or set SUPABASE_ACCESS_TOKEN from: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

echo "Linking project ${PROJECT_REF}..."
npx supabase link --project-ref "$PROJECT_REF"

echo "Dumping schema to ${OUT_FILE}..."
npx supabase db dump --schema-only -f "$OUT_FILE"

echo "Done: $(pwd)/${OUT_FILE}"
