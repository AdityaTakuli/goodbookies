# Deploy Good Bookies on GoDaddy (VPS only)

This guide runs **everything on your GoDaddy VPS**: the website, PostgreSQL, and auth (via self-hosted Supabase Docker).

**Does not work on:** GoDaddy shared hosting, cPanel File Manager-only upload, or GoDaddy **MySQL** (this app needs PostgreSQL + Supabase Auth).

**Minimum VPS:** 4 GB RAM, 2 vCPU, Ubuntu 22.04.

---

## What you upload

| Upload? | Path / item |
|---------|-------------|
| Yes (Git or ZIP) | Full repo **except** `node_modules`, `dist`, `.env` |
| No | `node_modules` — run `npm ci` on the server |
| No | `.env` — create on server from `.env.godaddy.example` |
| No | SQL into GoDaddy MySQL — use Supabase Postgres on the VPS |

On the server you run `npm run build` (creates `dist/`), then `npm start`.

---

## 1. Domain DNS

In GoDaddy DNS for your domain:

| Type | Name | Value |
|------|------|--------|
| A | `@` | Your VPS public IP |
| A | `www` | Same IP |

---

## 2. VPS setup (SSH as root)

```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

npm install -g pm2
```

---

## 3. Database (Supabase Docker on the VPS)

```bash
mkdir -p /opt/supabase && cd /opt/supabase
git clone --depth 1 https://github.com/supabase/supabase.git .
cd docker
cp .env.example .env
nano .env   # set POSTGRES_PASSWORD, JWT_SECRET, SITE_URL=https://yourdomain.com
docker compose up -d
```

Note keys from `/opt/supabase/docker/.env`:

- `ANON_KEY` → `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_PUBLISHABLE_KEY`
- `SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`
- API URL (internal): `http://127.0.0.1:8000`

### Run migrations (in order)

In Supabase Studio (tunnel port 54323) or `psql` into Postgres, run each file under `supabase/migrations/` **sorted by filename**:

1. `20260526080857_b26193df-1960-4212-9183-0fddca82ca20.sql`
2. `20260526080921_3abd8599-6fcf-40c3-b7d1-ffd2eb8718c2.sql`
3. `20260527034047_15d97e49-bc41-49fb-bbb1-41c783f33f1d.sql`
4. `20260527120000_wave2_extensions.sql`
5. `20260528120000_wave2b_owner.sql`
6. `20260528123000_harden_user_roles_rls.sql`
7. `20260528125000_bootstrap_owner_core.sql`
8. `20260528163500_add_players_capacity.sql`
9. `20260528173000_add_booking_player_names.sql`
10. `20260528180000_capacity_booking_index.sql`
11. `20260601120000_open_lobbies.sql`
12. `20260604120000_venue_reviews.sql`

In Supabase Auth settings, add redirect URLs: `https://yourdomain.com/**`

---

## 4. Deploy the app

```bash
mkdir -p /var/www/goodbookies && cd /var/www/goodbookies
git clone YOUR_REPO_URL .
cp .env.godaddy.example .env
nano .env   # paste keys from Supabase docker .env
npm ci
npm run build
npm start   # test: curl -I http://127.0.0.1:3000
```

Keep it running:

```bash
pm2 start npm --name goodbookies -- start
pm2 save
pm2 startup
```

---

## 5. Nginx + HTTPS

```bash
nano /etc/nginx/sites-available/goodbookies
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
ln -sf /etc/nginx/sites-available/goodbookies /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 6. Updates (redeploy)

```bash
cd /var/www/goodbookies
git pull
npm ci
npm run build
pm2 restart goodbookies
```

---

## Troubleshooting

| Problem | Check |
|---------|--------|
| Blank page | `pm2 logs goodbookies`, `dist/client` exists after build |
| Auth fails | `SITE_URL` and redirect URLs in Supabase; `VITE_*` set **before** `npm run build` |
| DB errors | Migrations applied; `SUPABASE_SERVICE_ROLE_KEY` in `.env` |
| 502 from Nginx | `pm2 status`, port 3000 listening |

---

## GoDaddy MySQL product

Not used for this project. The database is **PostgreSQL inside Supabase Docker** on the same VPS.
