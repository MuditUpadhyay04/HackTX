#!/usr/bin/env bash
# Un-Said on one Lightsail or EC2 instance: Docker + Caddy (automatic HTTPS) + the backend.
#
#   sudo GIT_TOKEN=<read-only token, only while the repo is private> bash bootstrap.sh
#
# Safe to re-run: it installs what's missing, updates the code, keeps /srv/unsaid/.env and
# /srv/unsaid/data, and re-derives the sslip.io name if the public IP changed (static IP attached).
# Works on Ubuntu 22.04/24.04 and Amazon Linux 2023. Never pass API keys here; they go in .env.
#
# Optional env: GIT_TOKEN, REPO_URL, BRANCH (main), DOMAIN (your own domain), UNSAID_ROOT (/srv/unsaid)

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/MuditUpadhyay04/HackTX.git}"
BRANCH="${BRANCH:-main}"
ROOT="${UNSAID_ROOT:-/srv/unsaid}"
APP_DIR="$ROOT/HackTX"
ENV_FILE="$ROOT/.env"
DATA_DIR="$ROOT/data"
COMPOSE_FILE="$APP_DIR/deploy/aws/docker-compose.yml"
LOG_FILE=/var/log/unsaid-bootstrap.log

log() { printf '\n[unsaid] %s\n' "$*"; }
die() { printf '\n[unsaid] ERROR: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root: sudo bash bootstrap.sh"
touch "$LOG_FILE" && chmod 600 "$LOG_FILE"   # the log ends with the APP_KEY
exec > >(tee -a "$LOG_FILE") 2>&1
log "bootstrap started $(date -u +%FT%TZ)"
export UNSAID_ENV_FILE="$ENV_FILE" UNSAID_DATA_DIR="$DATA_DIR"   # read by docker-compose.yml

# ------------------------------------------------------------------ swap (small instances build images)
# Best effort: dd (not fallocate) so it also works on XFS, and a failure never stops the deploy.
if ! swapon --show | grep -q . && [ "$(awk '/MemTotal/ {print $2}' /proc/meminfo)" -lt 2000000 ]; then
  log "adding a 1 GB swap file"
  if [ ! -f /swapfile ]; then
    if ! { dd if=/dev/zero of=/swapfile bs=1M count=1024 status=none && chmod 600 /swapfile && mkswap /swapfile >/dev/null; }; then
      rm -f /swapfile
      log "couldn't create swap (continuing)"
    fi
  fi
  if [ -f /swapfile ] && swapon /swapfile; then
    grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
fi

# ------------------------------------------------------------------ Docker + Compose + git
# shellcheck source=/dev/null
. /etc/os-release
case "${ID:-}" in
  ubuntu|debian)
    export DEBIAN_FRONTEND=noninteractive
    if ! command -v git >/dev/null || ! command -v curl >/dev/null || ! command -v openssl >/dev/null; then
      apt-get update -y
      apt-get install -y ca-certificates curl git openssl
    fi
    if ! command -v docker >/dev/null; then
      log "installing Docker (get.docker.com: Docker Engine + buildx + compose plugins)"
      curl -fsSL https://get.docker.com | sh
    fi
    # Docker's own repo ships docker-compose-plugin; Ubuntu's docker.io pairs with docker-compose-v2.
    docker compose version >/dev/null 2>&1 \
      || apt-get install -y docker-compose-plugin \
      || apt-get install -y docker-compose-v2
    ;;
  amzn)
    command -v docker >/dev/null || dnf install -y docker
    command -v git >/dev/null || dnf install -y git
    command -v openssl >/dev/null || dnf install -y openssl
    if ! docker compose version >/dev/null 2>&1; then
      log "installing the Docker Compose plugin"
      mkdir -p /usr/local/lib/docker/cli-plugins
      curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
      chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    fi
    ;;
  *)
    die "unsupported OS '${ID:-unknown}'. Use Ubuntu 24.04 or Amazon Linux 2023."
    ;;
esac
systemctl enable --now docker >/dev/null
docker compose version

# ------------------------------------------------------------------ code
git_auth() {
  # A private repo needs a token. It's sent as a header and never written to .git/config.
  if [ -n "${GIT_TOKEN:-}" ]; then
    local basic
    basic=$(printf 'x-access-token:%s' "$GIT_TOKEN" | base64 | tr -d '\n')
    git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $basic" "$@"
  else
    git "$@"
  fi
}

mkdir -p "$ROOT" "$DATA_DIR"
if [ -d "$APP_DIR/.git" ]; then
  log "updating the code ($BRANCH)"
  git_auth -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  # A deploy copy: it always matches the branch exactly. Settings live in $ENV_FILE, not here.
  git -C "$APP_DIR" checkout -q -f -B "$BRANCH" FETCH_HEAD
else
  log "cloning $REPO_URL ($BRANCH)"
  git_auth clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR" \
    || die "clone failed. Private repo? Re-run with GIT_TOKEN=<token with Contents: read-only>."
fi
git -C "$APP_DIR" log --oneline -1

# ------------------------------------------------------------------ settings (/srv/unsaid/.env)
get_env() { grep -E "^$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- || true; }
set_env() {
  if grep -qE "^$1=" "$ENV_FILE"; then
    sed -i "s|^$1=.*|$1=$2|" "$ENV_FILE"
  else
    printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE"
  fi
}

if [ ! -f "$ENV_FILE" ]; then
  log "creating $ENV_FILE from env.template"
  cp "$APP_DIR/deploy/aws/env.template" "$ENV_FILE"
fi
chmod 600 "$ENV_FILE"

public_ip() {
  local token ip
  token=$(curl -fsS -m 3 -X PUT http://169.254.169.254/latest/api/token \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
  ip=$(curl -fsS -m 3 -H "X-aws-ec2-metadata-token: $token" \
    http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
  [ -n "$ip" ] || ip=$(curl -fsS -m 5 https://checkip.amazonaws.com 2>/dev/null | tr -d '[:space:]' || true)
  printf '%s' "$ip"
}

IP=$(public_ip)
[ -n "$IP" ] || die "couldn't find this instance's public IP"
AUTO_DOMAIN="${IP//./-}.sslip.io"

current_domain=$(get_env DOMAIN)
if [ -n "${DOMAIN:-}" ]; then
  new_domain="$DOMAIN"                      # passed in: your own domain
elif [ -z "$current_domain" ] || [[ "$current_domain" == *.sslip.io || "$current_domain" == *.nip.io ]]; then
  new_domain="$AUTO_DOMAIN"                 # follow the IP (e.g. after attaching a static IP)
else
  new_domain="$current_domain"              # a custom domain set earlier: keep it
fi
if [ "$new_domain" != "$current_domain" ]; then
  log "DOMAIN: ${current_domain:-<empty>} -> $new_domain"
  set_env DOMAIN "$new_domain"
  base=$(get_env PUBLIC_BASE_URL)
  if [ -z "$base" ] || [ "$base" = "https://$current_domain" ]; then
    set_env PUBLIC_BASE_URL "https://$new_domain"
  fi
fi
[ -n "$(get_env PUBLIC_BASE_URL)" ] || set_env PUBLIC_BASE_URL "https://$new_domain"
[ -n "$(get_env APP_KEY)" ] || { log "generating APP_KEY"; set_env APP_KEY "$(openssl rand -hex 12)"; }

DOMAIN_NOW=$(get_env DOMAIN)
APP_KEY_NOW=$(get_env APP_KEY)

# ------------------------------------------------------------------ build + start
log "building the backend image"
docker build -t unsaid-backend:local "$APP_DIR/backend"

log "starting Caddy + backend"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-build --remove-orphans

# ------------------------------------------------------------------ wait for HTTPS
log "waiting for https://$DOMAIN_NOW (the first certificate can take a minute)"
ok=""
for _ in $(seq 1 36); do
  if curl -fsS -m 5 "https://$DOMAIN_NOW/api/health" >/dev/null 2>&1; then ok=1; break; fi
  sleep 5
done

cat <<EOF

============================================================================
 Un-Said is $( [ -n "$ok" ] && echo "UP" || echo "STARTED, but https://$DOMAIN_NOW isn't answering yet" )

 App + demo panel   https://$DOMAIN_NOW/app/?key=$APP_KEY_NOW&demo=1
 Health             https://$DOMAIN_NOW/api/health
 Mom's letters      https://$DOMAIN_NOW/c/<token>

 mobile/.env.local on the laptop:
   EXPO_PUBLIC_API_URL=https://$DOMAIN_NOW
   EXPO_PUBLIC_APP_KEY=$APP_KEY_NOW

 Next: add the keys, apply them, check them
   sudo nano $ENV_FILE
   sudo $APP_DIR/deploy/aws/update.sh --no-pull
   sudo docker compose --env-file $ENV_FILE -f $COMPOSE_FILE exec backend python scripts/check_keys.py
============================================================================
EOF

if [ -z "$ok" ]; then
  cat <<EOF
 Not answering yet? Check, in order:
   1. The instance firewall / security group allows TCP 80 AND 443 from anywhere.
   2. $DOMAIN_NOW resolves to $IP (sslip.io names do this by themselves).
   3. Logs: sudo docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs --tail 80 caddy backend
EOF
fi
