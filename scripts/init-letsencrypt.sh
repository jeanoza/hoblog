#!/usr/bin/env bash
# First-time Let's Encrypt certificate for Docker Compose (webroot).
# Flow: HTTP bootstrap nginx → certbot → TLS nginx (no dummy cert).
# Requires: DOMAIN and CERTBOT_EMAIL in repo root .env; DNS A records for DOMAIN (+ www).
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Missing .env — copy from .env.example and set DOMAIN, CERTBOT_EMAIL, etc."
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

primary="${DOMAIN:-hoblog.space}"
email="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in .env}"
staging="${CERTBOT_STAGING:-0}"
force_renew="${CERTBOT_FORCE_RENEW:-0}"
rsa_key_size=4096
www_path="./certbot/www"
cert_path="./certbot/conf/live/${primary}/fullchain.pem"

if [[ "$staging" != "0" ]]; then
  staging_arg="--staging"
  echo "Using Let's Encrypt staging (untrusted cert; for testing only)."
else
  staging_arg=""
fi

if ! docker compose version &>/dev/null; then
  echo "docker compose is required."
  exit 1
fi

mkdir -p "${www_path}"

echo "Starting stack with HTTP bootstrap nginx (ACME only, no dummy cert)..."
export NGINX_CONFIG=nginx.bootstrap.conf
docker compose up -d --build

echo "Requesting Let's Encrypt certificate..."
certbot_args=(
  certonly --webroot -w /var/www/certbot
  --email "${email}"
  --rsa-key-size "${rsa_key_size}"
  --agree-tos --no-eff-email
  -d "${primary}" -d "www.${primary}"
)
if [[ -n "${staging_arg}" ]]; then
  certbot_args=(--staging "${certbot_args[@]}")
fi
if [[ "${force_renew}" != "0" ]]; then
  certbot_args+=(--force-renewal)
fi
docker compose --profile certbot run --rm --no-deps certbot "${certbot_args[@]}"

if [[ ! -f "${cert_path}" ]]; then
  # certbot may use a suffixed lineage (e.g. domain-0001) if live/domain was occupied before
  alt=$(find ./certbot/conf/live -maxdepth 1 -type d -name "${primary}-*" 2>/dev/null | head -1)
  if [[ -n "${alt}" && -f "${alt}/fullchain.pem" ]]; then
    echo "Certificate found at ${alt}/ — update ssl_certificate paths in nginx/nginx.conf to match."
    exit 1
  fi
  echo "Certificate not found at ${cert_path}"
  exit 1
fi

echo "Switching to TLS nginx config..."
export NGINX_CONFIG=nginx.conf
docker compose up -d --force-recreate nginx

echo "Reloading nginx..."
docker compose exec nginx nginx -s reload

echo "Done. App should be available at https://${primary}"
