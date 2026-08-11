#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/staywise}"

cd "${APP_DIR}"
git pull --ff-only
docker compose -f docker-compose.hostinger.yml --env-file .env.hostinger up -d --build
docker image prune -f
docker compose -f docker-compose.hostinger.yml ps
