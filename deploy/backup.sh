#!/usr/bin/env bash
# Nightly backup of the database and the uploaded files.
# Usage:  bash deploy/backup.sh  [destination-folder]
# Cron:   15 2 * * *  cd /var/www/dmp && bash deploy/backup.sh /var/backups/dmp >> /var/log/dmp-backup.log 2>&1
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-$APP_DIR/backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

# Read database settings from .env without exporting secrets to the log.
set -a; . "$APP_DIR/.env"; set +a

mkdir -p "$DEST"

echo "[$(date -Is)] dumping database $DB_NAME"
mysqldump --host="${DB_HOST:-127.0.0.1}" --port="${DB_PORT:-3306}" \
  --user="$DB_USER" --password="$DB_PASSWORD" \
  --single-transaction --routines --triggers --quick \
  "$DB_NAME" | gzip -9 > "$DEST/db-$STAMP.sql.gz"

echo "[$(date -Is)] archiving uploads"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C "$APP_DIR" "${UPLOAD_DIR:-public/uploads}"

echo "[$(date -Is)] pruning backups older than $KEEP_DAYS days"
find "$DEST" -name 'db-*.sql.gz'      -mtime "+$KEEP_DAYS" -delete
find "$DEST" -name 'uploads-*.tar.gz' -mtime "+$KEEP_DAYS" -delete

echo "[$(date -Is)] done -> $DEST"
