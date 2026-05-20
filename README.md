# Hoblog

A personal hobby life-log web application.

## Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | Next.js (TypeScript, App Router)        |
| Backend  | NestJS (TypeScript, Clean Architecture) |
| ORM      | Prisma                                  |
| Database | PostgreSQL (Docker)                     |

## Project Structure

```
hoblog/
  frontend/   — Next.js app
  backend/    — NestJS API
  db/         — Docker Compose for PostgreSQL
```

## Local Development

### 1. Start the database

```bash
cd db
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run generate
npm run migrate
npm run start:dev
```

Backend runs at: http://localhost:20002

Health check: http://localhost:20002/health

### 3. Start the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at: http://localhost:20001

### Full stack (Docker Compose + nginx)

From the repo root:

```bash
cp .env.example .env
# fill in POSTGRES_* and copy backend/.env.example → backend/.env
docker compose up -d --build
```

App (via nginx): http://localhost  
API: http://localhost/api/...  
Health check: http://localhost/api/health

For cloud deploy, set `FRONTEND_URL` in the **repo root** `.env` to your public origin (e.g. `http://203.0.113.10` or `https://yourdomain.com`). `NEXT_PUBLIC_API_URL=/api` stays relative.

### HTTPS (Let's Encrypt, jeanoza.com)

Prerequisites on the server:

- DNS **A** records for `jeanoza.com` and `www.jeanoza.com` pointing to the host
- Ports **80** and **443** open in the firewall / security group
- Root `.env` production values, for example:

```bash
DOMAIN=jeanoza.com
CERTBOT_EMAIL=you@example.com
NGINX_CONFIG=nginx.conf
NGINX_HOST_PORT=80
NGINX_HTTPS_PORT=443
FRONTEND_URL=https://jeanoza.com
NEXT_PUBLIC_API_URL=/api
```

First certificate (creates a short-lived dummy cert, then requests a real one and reloads nginx):

```bash
chmod +x scripts/init-letsencrypt.sh scripts/renew-letsencrypt.sh
./scripts/init-letsencrypt.sh
```

Test with staging first (avoids rate limits): set `CERTBOT_STAGING=1` in `.env`, run the script, then set `CERTBOT_STAGING=0` and run again for a production cert.

Renewal (add to host cron, e.g. daily at 03:00):

```bash
0 3 * * * /path/to/hoblog/scripts/renew-letsencrypt.sh >> /var/log/certbot-renew.log 2>&1
```

Local Compose keeps HTTP-only via default `NGINX_CONFIG=nginx.http.conf` (no certs required).

## Environment files

Three env files are intentional: each runtime loads from its own directory. Do not merge into a single file unless you also wire Next/Nest to read from the repo root.

### Which file when

| File | Used by | When |
|------|---------|------|
| `.env` (repo root) | `docker compose` | Full stack in Docker (db, backend, frontend, nginx) |
| `backend/.env` | NestJS (`npm run start:dev`, Prisma CLI) | Local backend dev; also `env_file` for the backend container |
| `frontend/.env.local` | Next.js (`npm run dev`) | Local frontend dev only (not used by Docker) |

Copy templates: `.env.example` → `.env`, `backend/.env.example` → `backend/.env`, `frontend/.env.example` → `frontend/.env.local`.

### Variable matrix (local dev vs Docker Compose)

| Variable | Local dev | Docker Compose | Notes |
|----------|-----------|----------------|-------|
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` → `http://localhost:20002` | Root `.env` → `/api` | **Build-time** for Docker (`docker compose build`). Browser calls backend directly in local dev; via nginx `/api` in Compose. |
| `FRONTEND_URL` | `backend/.env` → `http://localhost:20001` | Root `.env` → `http://localhost` (or your public origin) | CORS / cookies. Compose **overrides** `backend/.env` at runtime (`docker-compose.yml` → `environment`). |
| `DATABASE_URL` | `backend/.env` → `localhost:20003` | Compose override → `db:5432` | Same override pattern as `FRONTEND_URL`. |
| `PORT` (backend) | `backend/.env` → `20002` | Root `BACKEND_PORT` → `20002` | Compose sets container `PORT` from `${BACKEND_PORT}`. |
| `PORT` (frontend) | Next default / dev server | Root `FRONTEND_PORT` → `20001` | Only set in Compose `environment` for the frontend container. |
| Postgres credentials | — | Root `.env` (`POSTGRES_*`) | Used by `db` service and to build `DATABASE_URL` for backend. |
| JWT, cookies, GCS | `backend/.env` only | `backend/.env` | Secrets stay in backend; not in root `.env`. |

### Overlapping names (not duplicates by mistake)

These appear in more than one file with **different values on purpose**:

- **`FRONTEND_URL`** — Local: frontend origin with port (`:20001`). Docker: nginx entry URL (often `http://localhost` without app port). When running Compose, only the root `.env` value applies to the backend container.
- **`NEXT_PUBLIC_API_URL`** — Local: absolute backend URL. Docker: relative `/api` so the same image works behind any host/IP. Changing root `.env` requires `docker compose build frontend`.

### Root-only (Compose / nginx)

| Variable | Role |
|----------|------|
| `POSTGRES_*`, `POSTGRES_HOST_PORT` | Database container |
| `BACKEND_PORT`, `FRONTEND_PORT` | Internal ports; must match `nginx/nginx.conf` upstreams (`backend:20002`, `frontend:20001`) |
| `NGINX_HOST_PORT` | Host port mapped to nginx (`80` → `http://localhost`) |
| `NGINX_HTTPS_PORT` | Host port mapped to nginx HTTPS (`443`) |
| `NGINX_CONFIG` | `nginx.http.conf` (local) or `nginx.conf` (TLS) |
| `DOMAIN`, `CERTBOT_EMAIL`, `CERTBOT_STAGING` | Let's Encrypt (`scripts/init-letsencrypt.sh`) |
| `NEXT_PUBLIC_API_URL` | Frontend image build arg |
| `FRONTEND_URL` | Backend CORS origin in Compose |

### Backend-only secrets

`JWT_*`, `COOKIE_SECRET`, `GCS_*` — keep in `backend/.env` only. Do not add `env_file: .env` on the frontend service (would inject DB/JWT into the wrong container).

## Prisma

| Command | Description |
|---------|-------------|
| `npm run generate` | Regenerate Prisma client after schema changes |
| `npm run migrate` | Create and apply a new migration (dev) |
| `npm run migrate:deploy` | Apply pending migrations (production) |
| `npm run migrate:status` | Check migration status |
| `npm run seed` | Seed the database with initial data |
