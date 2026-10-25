#!/usr/bin/env bash
# Pull the latest code, rebuild the backend, restart it. Caddy and its certificates stay up.
# Then build the phone mock (Branched-Frontend + the Un-Said web build) and serve it at
# https://phone.<DOMAIN>/phone. The phone comes last and never holds up or breaks the backend:
# its running container is only replaced after a new image built successfully.
#
#   sudo /srv/unsaid/HackTX/deploy/aws/update.sh             # pull + rebuild + restart (+ phone)
#   sudo /srv/unsaid/HackTX/deploy/aws/update.sh --no-pull   # apply an edited /srv/unsaid/.env
#                                                            # (rebuilds the phone only if it's missing
#                                                            #  or APP_KEY / DOMAIN changed)
#   sudo /srv/unsaid/HackTX/deploy/aws/update.sh --no-phone  # backend only, as before
#
# Optional env: GIT_TOKEN (while the repo is private), BRANCH (main), UNSAID_ROOT (/srv/unsaid)

set -euo pipefail

ROOT="${UNSAID_ROOT:-/srv/unsaid}"
APP_DIR="$ROOT/HackTX"
ENV_FILE="$ROOT/.env"
COMPOSE_FILE="$APP_DIR/deploy/aws/docker-compose.yml"
BRANCH="${BRANCH:-main}"
PHONE_IMAGE=unsaid-phone:local
export UNSAID_ENV_FILE="$ENV_FILE" UNSAID_DATA_DIR="$ROOT/data"   # read by docker-compose.yml
export DOCKER_BUILDKIT=1   # the phone build reads Branched-Frontend/Dockerfile.dockerignore

log() { printf '\n[unsaid] %s\n' "$*"; }
[ "$(id -u)" -eq 0 ] || { echo "run as root: sudo $0" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "no $ENV_FILE yet: run bootstrap.sh first" >&2; exit 1; }
compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }
get_env() { grep -E "^$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- || true; }

PULL=1; REBUILD=1; PHONE=1
for arg in "$@"; do
  case "$arg" in
    --no-pull) PULL=0; REBUILD=0 ;;
    --pulled) PULL=0 ;;   # internal: this script re-running itself after a pull
    --no-phone) PHONE=0 ;;
    *) echo "usage: $0 [--no-pull] [--no-phone]" >&2; exit 2 ;;
  esac
done

if [ "$PULL" = 1 ]; then
  log "pulling $BRANCH"
  if [ -n "${GIT_TOKEN:-}" ]; then
    basic=$(printf 'x-access-token:%s' "$GIT_TOKEN" | base64 | tr -d '\n')
    git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $basic" -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  else
    git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  fi
  git -C "$APP_DIR" checkout -q -f -B "$BRANCH" FETCH_HEAD
  git -C "$APP_DIR" log --oneline -1
  # Carry on with the update.sh that was just pulled, not the copy bash already has open.
  if [ -z "${UNSAID_UPDATE_REEXEC:-}" ]; then
    export UNSAID_UPDATE_REEXEC=1
    if [ "$PHONE" = 1 ]; then exec bash "$APP_DIR/deploy/aws/update.sh" --pulled
    else exec bash "$APP_DIR/deploy/aws/update.sh" --pulled --no-phone; fi
  fi
fi

if [ "$REBUILD" = 1 ]; then
  log "rebuilding the backend image"
  docker build -t unsaid-backend:local "$APP_DIR/backend"
fi

# The phone is in the compose profile "phone": on only once its image exists, so a missing or
# failed phone build never stops the backend or Caddy from starting.
if docker image inspect "$PHONE_IMAGE" >/dev/null 2>&1; then export COMPOSE_PROFILES=phone; else unset COMPOSE_PROFILES; fi

log "restarting the backend (Caddy stays up)"
compose up -d --no-build --no-deps --force-recreate backend   # new image and/or new .env
compose up -d --no-build --remove-orphans                      # Caddy: only if it isn't running
# A file bind mount keeps the old Caddyfile after a pull (git writes a new file), so a changed
# Caddyfile needs a fresh container; otherwise a reload is enough.
if compose exec -T caddy cat /etc/caddy/Caddyfile 2>/dev/null | cmp -s - "$APP_DIR/deploy/aws/Caddyfile"; then
  compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile >/dev/null 2>&1 || true
else
  log "the Caddyfile changed: recreating Caddy (certificates are kept in the caddy_data volume)"
  compose up -d --no-build --no-deps --force-recreate caddy
fi

DOMAIN=$(get_env DOMAIN)
backend_ok=""
for _ in $(seq 1 24); do
  if curl -fsS -m 5 "https://$DOMAIN/api/health"; then echo; backend_ok=1; break; fi
  sleep 5
done
if [ -z "$backend_ok" ]; then
  log "https://$DOMAIN isn't answering. Logs: sudo docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs --tail 80"
  exit 1
fi
log "up: https://$DOMAIN"

[ "$PHONE" = 1 ] || { docker image prune -f >/dev/null; exit 0; }

# ------------------------------------------------------------------ the phone mock
PHONE_DOMAIN="phone.$DOMAIN"
PHONE_URL="https://$PHONE_DOMAIN/phone"

# Next + Expo builds can run a 2 GB server out of memory: add 2 GB of swap if there's none.
# Best effort: dd (not fallocate) so it also works on XFS, and a failure never stops the deploy.
if ! swapon --show | grep -q .; then
  SWAP=/swapfile
  [ -e "$SWAP" ] && SWAP=/swapfile-unsaid
  log "no swap: adding 2 GB at $SWAP for the phone build"
  if [ ! -f "$SWAP" ]; then
    if ! { dd if=/dev/zero of="$SWAP" bs=1M count=2048 status=none && chmod 600 "$SWAP" && mkswap "$SWAP" >/dev/null; }; then
      rm -f "$SWAP"
      log "couldn't create swap (continuing)"
    fi
  fi
  if [ -f "$SWAP" ] && swapon "$SWAP"; then
    grep -q "^$SWAP " /etc/fstab || echo "$SWAP none swap sw 0 0" >> /etc/fstab
  fi
fi

# The Un-Said web build inside the phone calls this backend; both values are baked into its bundle.
API_URL="https://$DOMAIN"
APP_KEY_VAL=$(get_env APP_KEY)
cfg=$(printf '%s\n%s\n' "$API_URL" "$APP_KEY_VAL" | sha256sum | cut -c1-16)   # never the key itself
built_cfg=$(docker image inspect -f '{{ index .Config.Labels "unsaid.phone.cfg" }}' "$PHONE_IMAGE" 2>/dev/null || true)

phone_status=0
if [ ! -f "$APP_DIR/Branched-Frontend/Dockerfile" ]; then
  log "no Branched-Frontend/Dockerfile in this checkout: skipping the phone"
  phone_status=3
elif [ "$REBUILD" = 1 ] || [ "$built_cfg" != "$cfg" ]; then
  log "building the phone image (Un-Said web build + Next.js; 5-10 minutes the first time)"
  if docker build -f "$APP_DIR/Branched-Frontend/Dockerfile" -t "$PHONE_IMAGE" \
      --label "unsaid.phone.cfg=$cfg" \
      --build-arg "EXPO_PUBLIC_API_URL=$API_URL" \
      --build-arg "EXPO_PUBLIC_APP_KEY=$APP_KEY_VAL" \
      --build-arg EXPO_PUBLIC_DEMO_DATA=1 \
      "$APP_DIR"; then
    log "phone image built: swapping the phone container"
    compose --profile phone up -d --no-build --no-deps --force-recreate phone
  else
    log "the phone build FAILED. The backend is up and unchanged; the phone keeps its previous version (if any)."
    phone_status=3
  fi
else
  log "phone image is current: making sure it's running"
  compose --profile phone up -d --no-build --no-deps phone
fi
docker image prune -f >/dev/null

if docker image inspect "$PHONE_IMAGE" >/dev/null 2>&1; then
  phone_ok=""
  for _ in $(seq 1 30); do   # the first visit also waits for phone.<domain>'s certificate
    if curl -fsS -m 5 -o /dev/null "https://$PHONE_DOMAIN/unsaid"; then phone_ok=1; break; fi
    sleep 5
  done
  if [ -n "$phone_ok" ]; then
    log "phone up: $PHONE_URL"
  else
    log "the phone isn't answering at https://$PHONE_DOMAIN yet. Logs: sudo docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs --tail 80 phone caddy"
    phone_status=3
  fi
fi
cat <<EOF

============================================================================
 Backend   https://$DOMAIN
 Phone     $PHONE_URL
           (device frame: https://$PHONE_DOMAIN/device)
============================================================================
EOF
exit "$phone_status"
