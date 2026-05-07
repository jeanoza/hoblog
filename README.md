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

## Prisma

| Command | Description |
|---------|-------------|
| `npm run generate` | Regenerate Prisma client after schema changes |
| `npm run migrate` | Create and apply a new migration (dev) |
| `npm run migrate:deploy` | Apply pending migrations (production) |
| `npm run migrate:status` | Check migration status |
| `npm run seed` | Seed the database with initial data |
