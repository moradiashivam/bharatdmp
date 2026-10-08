# Deployment guide

The system is a Node.js (Express) application with a MySQL/MariaDB database.
It runs on any Linux server, or on Windows via `setup.bat`.

## 1. Requirements

- Node.js 18 or newer
- MySQL 8 or MariaDB 10.6+
- nginx (or any reverse proxy) with an SSL certificate
- An SMTP account for outgoing email

## 2. First install (Linux)

```bash
git clone <your-repo> /var/www/dmp && cd /var/www/dmp
npm ci --omit=dev
cp .env.production.example .env        # then fill it in
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"  # SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"  # JWT_SECRET

mysql -u root -p -e "CREATE DATABASE dmp_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p dmp_system < db/schema.sql
for f in db/phase*.sql; do mysql -u root -p dmp_system < "$f"; done
mysql -u root -p dmp_system < db/seed.sql        # roles, permissions, field types, default theme
npm run seed:admin                                # first super admin from .env
```

## 3. First install (Windows)

Double-click `setup.bat`. It installs the packages, creates the database and
tables, and creates the first administrator from the values in `.env`.

## 4. Run it

```bash
npm i -g pm2
mkdir -p logs
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

Health checks: `curl -s http://127.0.0.1:3000/health` (readiness, 503 when the database is down) and `/health/live` (liveness). Logs are JSON lines; set `SENTRY_DSN` and `BUILD_SHA` for error tracking. See `docs/OBSERVABILITY.md`.

## 5. Reverse proxy and HTTPS

```bash
cp deploy/nginx.conf.sample /etc/nginx/sites-available/dmp
# edit the server_name, then:
ln -s /etc/nginx/sites-available/dmp /etc/nginx/sites-enabled/dmp
nginx -t && systemctl reload nginx
certbot --nginx -d dmp.example.org
```

## 6. Backups

```bash
chmod +x deploy/backup.sh
crontab -e
# 15 2 * * * cd /var/www/dmp && bash deploy/backup.sh /var/backups/dmp >> /var/log/dmp-backup.log 2>&1
```

## 7. Updating

```bash
cd /var/www/dmp
git pull
npm ci --omit=dev
for f in db/phase*.sql; do mysql -u dmp_app -p dmp_system < "$f"; done   # migrations are idempotent
pm2 reload dmp-system
```

## 8. Running more than one process

Sessions live in the database, so you can raise `instances` in
`ecosystem.config.js` (or set `PM2_INSTANCES=max`) and run the app across all
CPU cores behind the same proxy.

## 9. Checklist after deployment

- [ ] Sign in as the administrator and change the seeded password
- [ ] Admin → Email settings: configure SMTP and send a test message
- [ ] Admin → Settings: site name, contact details, upload limits
- [ ] Admin → Themes and Public Pages: brand the public website
- [ ] Create the first funder or institution and its first DMP project
- [ ] Open the project's public link and register a test researcher end to end
- [ ] Confirm `/health`, `npm run error:test`, HTTPS redirect and nightly backup all work

See `SECURITY.md` for the hardening checklist.
