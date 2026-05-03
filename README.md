# Hoblog

A personal hobby life-log web application.

## Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | Next.js (TypeScript, App Router) |
| Backend  | NestJS (TypeScript, Clean Architecture) |
| ORM      | Prisma                  |
| Database | PostgreSQL (Docker)     |

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
cp .env .env  # already provided
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Backend runs at: http://localhost:3001

Health check: http://localhost:3001/health

### 3. Start the frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at: http://localhost:3000
