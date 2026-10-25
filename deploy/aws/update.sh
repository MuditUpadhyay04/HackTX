#!/usr/bin/env bash
# Pull the latest code, rebuild the backend, restart it. Caddy and its certificates stay up.
#
#   sudo /srv/unsaid/HackTX/deploy/aws/update.sh             # pull + rebuild + restart
#   sudo /srv/unsaid/HackTX/deploy/aws/update.sh --no-pull   # just apply an edited /srv/unsaid/.env
#
# Optional env: GIT_TOKEN (while the repo is private), BRANCH (main), UNSAID_ROOT (/srv/unsaid)

set -euo pipefail

ROOT="${UNSAID_ROOT:-/srv/unsaid}"
APP_DIR="$ROOT/HackTX"
ENV_FILE="$ROOT/.env"
COMPOSE_FILE="$APP_DIR/deploy/aws/docker-compose.yml"
BRANCH="${BRANCH:-main}"
export UNSAID_ENV_FILE="$ENV_FILE" UNSAID_DATA_DIR="$ROOT/data"   # read by docker-compose.yml

log() { printf '\n[unsaid] %s\n' "$*"; }
[ "$(id -u)" -eq 0 ] || { echo "run as root: sudo $0" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "no $ENV_FILE yet: run bootstrap.sh first" >&2; exit 1; }
compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

if [ "${1:-}" != "--no-pull" ]; then
  log "pulling $BRANCH"
  if [ -n "${GIT_TOKEN:-}" ]; then
    basic=$(printf 'x-access-token:%s' "$GIT_TOKEN" | base64 | tr -d '\n')
    git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $basic" -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  else
    git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  fi
  git -C "$APP_DIR" checkout -q -f -B "$BRANCH" FETCH_HEAD
  git -C "$APP_DIR" log --oneline -1
  log "rebuilding the backend image"
  docker build -t unsaid-backend:local "$APP_DIR/backend"
fi

log "restarting the backend (Caddy stays up)"
compose up -d --no-build --no-deps --force-recreate backend   # new image and/or new .env
compose up -d --no-build --remove-orphans                      # Caddy: only if it isn't running
compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile >/dev/null 2>&1 || true
docker image prune -f >/dev/null

DOMAIN=$(grep -E '^DOMAIN=' "$ENV_FILE" | tail -n 1 | cut -d= -f2-)
for _ in $(seq 1 24); do
  if curl -fsS -m 5 "https://$DOMAIN/api/health"; then echo; log "up: https://$DOMAIN"; exit 0; fi
  sleep 5
done
log "https://$DOMAIN isn't answering. Logs: sudo docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs --tail 80"
exit 1
