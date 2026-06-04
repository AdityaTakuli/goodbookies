# Deploy Good Bookies on GoDaddy Node.js (beta)

## Fix for your current errors

| Log error | Cause | Fix |
|-----------|--------|-----|
| `vite: not found` | Platform ran **`npm run dev`** without installing deps | Use **`npm start`**, not dev |
| `Cannot find package '@lovable.dev/vite-tanstack-config'` | Build deps missing or dev-only install skipped | `.npmrc` has `include=dev`; build deps are in `dependencies` |
| `path=/node_modules does not exist` | Zip included no install, or install failed | Upload **without** `node_modules`; let GoDaddy run `npm install` |

## GoDaddy project settings

Set these in the GoDaddy Node app panel (not the default Vite dev server):

| Setting | Value |
|---------|--------|
| **Build command** | `npm run build` |
| **Start command** | `npm start` |
| **Do not use** | `npm run dev` or `vite` |

## Required `package.json` fields (already set)

- `name`, `version`, `main` → `server-godaddy.mjs`
- `scripts.build` → `vite build`
- `scripts.start` → `node server-godaddy.mjs`
- App listens on `process.env.PORT` (GoDaddy sets this)

## Environment variables (set before build + at runtime)

Build needs `VITE_*` baked in:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

Runtime (server):

```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Optional later: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

**Database:** Use **Supabase** (HTTPS on port 443). GoDaddy MySQL in cPanel does not match this app. GoDaddy’s beta allows outbound 80/443 — Supabase cloud works.

## Zip upload (max 100MB)

Include:

- `src/`, `api/`, `supabase/migrations/` (for reference)
- `package.json`, `package-lock.json`, `vite.config.ts`, `server-godaddy.mjs`, `.npmrc`
- `tsconfig.json`, `components.json`, etc.

**Exclude:**

- `node_modules/`
- `dist/` (built on server)
- `.env` (set vars in GoDaddy UI)

## Git sync

Push this repo; ensure build/start commands match the table above. Custom git hooks are not supported.

## After deploy

1. Open your GoDaddy app URL
2. Test `/login` and signup
3. In Supabase dashboard → Authentication → URL configuration: add your GoDaddy site URL

## Mobile API (`/api/mobile/*`)

Vercel serverless routes are not used on GoDaddy. The web app works via SSR. Mobile app APIs need extra wiring later if required.
