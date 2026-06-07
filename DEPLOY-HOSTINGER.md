# Deploy Good Bookies on Hostinger (Node.js Web App)

## hPanel settings (critical)

| Setting | Value |
|---------|--------|
| **Repository** | `AdityaTakuli/goodbookies` branch `main` |
| **Node version** | 20 or 22 |
| **Framework** | **Express** or **Node.js** — NOT “Vite static” / “React static” |
| **Build command** | `npm run build` or `npm run build:hostinger` |
| **Start command** | `npm start` |
| **Entry file** | **`app.js`** (must match — Hostinger often defaults to this) |
| **Output directory** | **leave empty** or `.` — do NOT set to `dist/client` only (that deploys static files without Node SSR) |
| **Root directory** | repository root (folder with `package.json`) |

If `logs/startup.log` and `DEPLOY_STATUS.txt` are **empty after redeploy**, Hostinger is **not running your Node app** — fix Entry file + Framework above, then Redeploy.

### If `DEPLOY_STATUS.txt` in `.builds/source/repository` stops at `postinstall-done`

That folder is the **build checkout**. Hostinger may run `npm start` in a **different** runtime folder. Also open **Deployments → latest deploy → Build log** (not Runtime Logs) and search for `[deploy]`.

After the latest `package.json`, `postinstall` also runs dist verify — you should see:

```text
[build] verify-dist OK — ready to start Node
postinstall-done
```

If start ran, Runtime Logs should show `[deploy] [app.js]` or `[server.js]`.

### If `DEPLOY_STATUS.txt` stops at `postinstall-done` only (no verify-dist line)

That means `npm install` ran but **build and start never ran**. Hostinger is treating the site as a **static** deploy (common when Vite is auto-detected).

Fix in hPanel → Deployments → **Settings**:

1. **Framework preset** → change to **Express.js** (not Vite / React / Other static)
2. **Output directory** → **delete / leave blank** (do not use `dist` or `dist/client`)
3. **Build command** → `npm run build`
4. **Start command** → `npm start`
5. **Entry file** → `app.js`
6. Save → **Redeploy**

After a good deploy, `DEPLOY_STATUS.txt` should show:

```text
postinstall-done
[build] verify-dist OK — ready to start Node
prestart
[app.js] Hostinger entry file executed
[start] hostinger-start.mjs
```

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

### 1. Read deploy status (File Manager)

After redeploy, open **both** in your app root (same folder as `package.json`):

```text
DEPLOY_STATUS.txt    ← check this first
logs/startup.log
```

`DEPLOY_STATUS.txt` should show lines like:

```text
postinstall-done
[build] skipped vite — using committed dist
[app.js] Hostinger entry file executed
[start] hostinger-start.mjs
```

If **both files are empty** → wrong Entry file / Framework in hPanel (see table above).

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
