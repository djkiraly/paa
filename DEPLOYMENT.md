# PAA Production Deployment Guide

Manual installation on a Linux VPS (Ubuntu/Debian). This guide covers bare-metal deployment with PM2, Nginx, and Let's Encrypt SSL.

---

## Prerequisites

- Ubuntu 22.04+ or Debian 12+
- Root or sudo access
- Domain DNS pointing to your server: `panhandleaviationalliance.org` and `www.panhandleaviationalliance.org`
- Neon Postgres database provisioned (connection string ready)

### Required software

```bash
# Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
corepack enable
corepack prepare pnpm@latest --activate

# PM2 process manager
sudo npm install -g pm2

# Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Build tools (for native modules like bcryptjs)
sudo apt install -y build-essential
```

Verify installations:

```bash
node -v    # v20.x
pnpm -v    # 10.x
pm2 -v     # 5.x
nginx -v
```

---

## 1. Create application directory

```bash
sudo mkdir -p /var/www/paa
sudo chown $USER:$USER /var/www/paa
```

---

## 2. Deploy application code

Clone or copy the project to the server:

```bash
cd /var/www/paa
git clone <your-repo-url> .
```

Or use `rsync` from your local machine:

```bash
rsync -avz --exclude node_modules --exclude .next --exclude .env \
  ./ user@your-server:/var/www/paa/
```

---

## 3. Install dependencies

```bash
cd /var/www/paa
pnpm install --frozen-lockfile
```

---

## 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with production values:

```
DATABASE_URL=postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
NEXT_PUBLIC_SITE_URL=https://panhandleaviationalliance.org
PORT=3000
AUTH_SECRET=<generate-a-random-secret>
```

Generate `AUTH_SECRET`:

```bash
npx auth secret
```

Copy the generated value into your `.env` file.

> **Note:** GCS (Google Cloud Storage) for media uploads is configured entirely through the admin Settings UI after deployment. No environment variables are needed for GCS.

---

## 5. Initialize the database

Push the schema to your Neon database:

```bash
pnpm db:push
```

Optionally seed with initial data:

```bash
pnpm db:seed
```

---

## 6. Build the application

```bash
pnpm build
```

This produces a standalone build in `.next/standalone/` with a self-contained `server.js`.

Copy static assets into the standalone output (required after every build):

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

---

## 7. Start with PM2

The PM2 config is provided at `infra/ecosystem.config.js`:

```bash
pm2 start infra/ecosystem.config.js
```

Verify it's running:

```bash
pm2 status
pm2 logs paa-web --lines 20
```

The app should now be listening on `http://127.0.0.1:3000`.

### Enable PM2 startup on boot

```bash
pm2 save
pm2 startup
```

Follow the printed command (it will ask you to run a `sudo` command to register the systemd service).

---

## 8. Configure Nginx

Copy the provided config:

```bash
sudo cp infra/nginx/panhandle-aviation.conf /etc/nginx/sites-available/panhandle-aviation
sudo ln -s /etc/nginx/sites-available/panhandle-aviation /etc/nginx/sites-enabled/
```

Remove the default site if present:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

> **Note:** The SSL certificate paths in the config (`/etc/letsencrypt/live/...`) won't exist yet. Complete the SSL step next, or temporarily comment out the HTTPS server block to verify HTTP works first.

---

## 9. SSL with Let's Encrypt

Obtain certificates:

```bash
sudo certbot --nginx \
  -d panhandleaviationalliance.org \
  -d www.panhandleaviationalliance.org
```

Certbot will modify the Nginx config to add/update SSL directives. Verify auto-renewal is active:

```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

Certificates auto-renew via systemd timer. For manual renewal:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 10. Verify deployment

```bash
# Local check
curl -I http://127.0.0.1:3000

# Public check
curl -I https://panhandleaviationalliance.org
```

You should see a `200 OK` response with proper headers.

---

## Updating the application

After each code change, run these steps on the server:

```bash
cd /var/www/paa

# 1. Pull latest code
git pull origin main

# 2. Install any new/updated dependencies
pnpm install --frozen-lockfile

# 3. Push any database schema changes
pnpm db:push

# 4. Build the application
pnpm build

# 5. Copy static assets into the standalone output
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# 6. Restart the application
pm2 restart paa-web

# 7. Verify it's running
pm2 status
pm2 logs paa-web --lines 20
```

> **Important:** Steps 5 is required because `output: "standalone"` produces a minimal `server.js` that does not include static assets or the `public/` folder. Skipping this will cause the app to crash or serve broken pages.

---

## Common operations

| Task | Command |
|---|---|
| View logs | `pm2 logs paa-web` |
| Restart app | `pm2 restart paa-web` |
| Stop app | `pm2 stop paa-web` |
| Monitor resources | `pm2 monit` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Check SSL expiry | `sudo certbot certificates` |
| Run DB migrations | `pnpm db:push` |
| Open DB studio | `pnpm db:studio` |

---

## Firewall

If using `ufw`:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

This opens ports 22 (SSH), 80 (HTTP), and 443 (HTTPS). Port 3000 stays internal — Nginx proxies to it.

---

## Docker alternative

If you prefer Docker over bare-metal PM2:

```bash
cd /var/www/paa

# Build and run
docker compose up -d --build

# View logs
docker compose logs -f web
```

The same Nginx and SSL setup applies — just proxy to the Docker container on port 3000 instead of the PM2 process. Environment variables are passed through `docker-compose.yml` from the host `.env` file.

---

## Troubleshooting

**App won't start / port in use:**

```bash
pm2 delete paa-web
lsof -i :3000
pm2 start infra/ecosystem.config.js
```

**502 Bad Gateway from Nginx:**

The app isn't running or isn't listening on port 3000. Check PM2 status and logs:

```bash
pm2 status
pm2 logs paa-web --err --lines 50
```

**Database connection errors:**

Verify `DATABASE_URL` in `.env` and that your server's IP is allowed in Neon's dashboard.

**Build fails with memory errors:**

Increase Node memory for the build:

```bash
NODE_OPTIONS="--max-old-space-size=2048" pnpm build
```

**Static assets not caching:**

Verify Nginx is running and the `/_next/static/` location block is active:

```bash
curl -I https://panhandleaviationalliance.org/_next/static/css/app.css
# Should show: Cache-Control: public, max-age=31536000, immutable
```
