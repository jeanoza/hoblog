#!/usr/bin/env bash
# Renew certificates and reload nginx. Run from cron on the host, e.g. daily:
#   0 3 * * * /path/to/hoblog/scripts/renew-letsencrypt.sh >> /var/log/certbot-renew.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

export NGINX_CONFIG=nginx.conf

docker compose --profile certbot run --rm --no-deps certbot renew
docker compose exec nginx nginx -s reload
