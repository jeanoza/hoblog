#!/usr/bin/env bash
# First-time Let's Encrypt certificate for Docker Compose (webroot).
# Requires: DOMAIN and CERTBOT_EMAIL in repo root .env; DNS A records for jeanoza.com (+ www).
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

primary="${DOMAIN:-jeanoza.com}"
email="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in .env}"
staging="${CERTBOT_STAGING:-0}"
rsa_key_size=4096
data_path="./certbot"
www_path="${data_path}/www"
conf_path="${data_path}/conf"

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

mkdir -p "${conf_path}/live/${primary}" "${www_path}"

if [[ ! -f "${conf_path}/live/${primary}/fullchain.pem" ]]; then
  echo "Creating temporary self-signed cert so nginx can start..."
  docker compose --profile certbot run --rm --no-deps certbot sh -c "\
    openssl req -x509 -nodes -newkey rsa:${rsa_key_size} -days 1 \
      -keyout /etc/letsencrypt/live/${primary}/privkey.pem \
      -out /etc/letsencrypt/live/${primary}/fullchain.pem \
      -subj '/CN=localhost'"
fi

export NGINX_CONFIG=nginx.conf
echo "Starting stack with TLS nginx config..."
docker compose up -d --build

echo "Requesting Let's Encrypt certificate..."
docker compose --profile certbot run --rm --no-deps certbot certonly --webroot \
  -w /var/www/certbot \
  ${staging_arg} \
  --email "${email}" \
  --rsa-key-size "${rsa_key_size}" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "${primary}" \
  -d "www.${primary}"

echo "Reloading nginx with real certificate..."
docker compose exec nginx nginx -s reload

echo "Done. App should be available at https://${primary}"
