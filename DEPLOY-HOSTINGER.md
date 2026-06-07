# Deploy Good Bookies on Hostinger (Node.js Web App)

## hPanel settings

| Setting | Value |
|---------|--------|
| **Repository** | `AdityaTakuli/goodbookies` branch `main` |
| **Node version** | 20 or 22 |
| **Build command** | `npm run build` or `npm run build:hostinger` |
| **Start command** | `npm start` |
| **Entry** | uses `package.json` → `scripts/hostinger-start.mjs` |

Do **not** run full Vite on Hostinger — `dist/` is pre-built by GitHub Actions and committed to `main`.

## Environment variables (hPanel → Environment)

Required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Optional (MySQL media):

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `VENUE_MEDIA_HOST`, `VENUE_MEDIA_PORT`, `VENUE_MEDIA_USER`, `VENUE_MEDIA_PASSWORD`, `VENUE_MEDIA_DATABASE`
- `MEDIA_PUBLIC_URL=https://goodbookies.co.in`

## 503 and no logs in hPanel

If the site shows **503** and Application Logs are empty:

### 1. Read the file log (File Manager)

After redeploy, open:

```text
logs/startup.log
```

in your app root (same folder as `package.json`). The last lines show why Node exited.

### 2. Debug URL (after partial start)

```text
https://goodbookies.co.in/debug/startup
```

Returns the same log as plain text.

### 3. Health check

```text
https://goodbookies.co.in/health
```

Should return `ok` when Node is running.

### 4. Common failures in `startup.log`

| Log message | Fix |
|-------------|-----|
| `Build output missing` | Redeploy from latest `main` (must include `dist/`) |
| `vite build failed on this host` | Set build command to `npm run build:hostinger` |
| `Cannot find module 'tsx'` | Run `npm install` on deploy; check `node_modules` exists |
| `Missing Supabase environment variable` | Add Supabase vars in hPanel Environment |
| `FATAL — server failed to start` | Read stack trace below that line in the log |

### 5. Manual redeploy

hPanel → Website → **Deployments** → **Redeploy** (or Restart Node app).

Wait 1–2 minutes, then check `logs/startup.log` again.
