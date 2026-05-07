You are building the initial monorepo scaffold for a personal hobby life-log web app called **Hoblog**.

The goal is to create a clean monorepo with separate frontend, backend, and database layers using the following stack:

* Frontend: Next.js (TypeScript, App Router)
* Backend: NestJS (TypeScript)
* ORM: Prisma
* Database: PostgreSQL
* Docker Compose for local database
* Monorepo root: `Hoblog/`

Create the project with the following root structure:

```txt
Hoblog/
  frontend/
  backend/
  db/
```

This is a monorepo, but do NOT use Turborepo, Nx, or pnpm workspaces yet.
Keep the setup simple, clean, and production-minded.

The project should be initialized for future Clean Architecture growth, but should NOT be overengineered yet.

---

# Goal

Set up the initial project scaffold for Hoblog so that:

* frontend contains a working Next.js app
* backend contains a working NestJS app
* backend is configured with Prisma
* db contains Docker Compose for PostgreSQL
* backend can connect to PostgreSQL
* Prisma schema is initialized
* project is ready for local development
* backend structure is compatible with future Clean Architecture expansion

Do NOT implement business features yet.

This task is ONLY for:

* project initialization
* architecture setup
* Prisma setup
* Docker setup
* local development environment

---

# 1. Root Structure

Create this structure:

```txt
Hoblog/
  frontend/
  backend/
  db/
  .gitignore
  .nvmrc
  README.md
```

Requirements:

* `.nvmrc` should contain:

  ```txt
  24
  ```

* Add a root `.gitignore` suitable for:

  * Node.js
  * Next.js
  * NestJS
  * Prisma
  * Docker
  * env files
  * OS junk
  * logs

* Add a root `README.md` including:

  * project name
  * stack summary
  * local setup steps
  * how to start db/backend/frontend
  * Prisma migration instructions

---

# 2. Frontend (Next.js)

Inside `frontend/`, initialize a Next.js app using:

* latest stable Next.js
* TypeScript
* App Router
* ESLint
* src directory enabled
* Tailwind CSS enabled
* import alias enabled (`@/*`)

Requirements:

* create a clean minimal landing page
* page title: `Hoblog`
* centered content:

  * title: `Hoblog`
  * subtitle: `Your hobby life log`

Do NOT add unnecessary demo content.

Frontend should have clean structure:

```txt
frontend/src/
  app/
  components/
  lib/
```

Add:

* `.env.example`
* sensible scripts
* clean formatting

Frontend env should include:

```env
NEXT_PUBLIC_API_URL=http://localhost:20002
```

---

# 3. Backend (NestJS)

Inside `backend/`, initialize a NestJS app using:

* latest stable NestJS
* TypeScript
* ESLint
* Prettier

The backend MUST NOT remain in the default flat NestJS starter structure.

The backend must be initialized in a way that is compatible with a Clean Architecture style from the start.

Even though no business domain is implemented yet, organize the backend so it is ready for modular growth using this direction:

* `presentation/` for controllers and DTOs
* `application/` for use cases
* `domain/` for entities and contracts
* `infrastructure/` for Prisma and external implementations

Do NOT overengineer.

Do NOT:

* add generic CRUD abstractions
* add repositories yet
* add unnecessary interfaces
* add business logic

Only prepare the structure for future expansion.

---

# 3.1 Backend Structure

Target backend structure should resemble:

```txt
backend/src/
  main.ts
  app.module.ts
  common/
    prisma/
      prisma.module.ts
      prisma.service.ts
  modules/
    health/
      presentation/
        health.controller.ts
      application/
        health.usecase.ts
      domain/
      infrastructure/
      health.module.ts
```

Requirements:

* keep app bootstrap minimal
* create a simple health module
* `/health` endpoint must return:

```json
{ "status": "ok" }
```

* health module should follow the same layered structure minimally

Do NOT add placeholder business modules yet.

---

# 4. Prisma Setup

Inside `backend/`:

* install Prisma
* install Prisma Client
* initialize Prisma
* configure PostgreSQL datasource
* generate Prisma Client

Prisma schema location:

```txt
backend/prisma/schema.prisma
```

Create minimal valid models:

* User
* Activity
* Category

Keep models minimal and realistic.

Do NOT overdesign.

Example fields:

* id
* createdAt
* updatedAt
* title/name
* relations where appropriate

Requirements:

* Prisma client generation configured
* PrismaService created for NestJS
* PrismaModule created
* Prisma ready for dependency injection later

Do NOT implement repositories yet.

---

# 5. Database (PostgreSQL via Docker)

Inside `db/`, create:

```txt
db/
  docker-compose.yml
  .env
```

Use PostgreSQL 17.

Requirements:

* latest stable PostgreSQL 17 image
* expose default PostgreSQL port
* database:

  * name: hoblog
  * user: hoblog
  * password: hoblog
* persistent Docker volume
* healthcheck included

DB env should include:

```env
POSTGRES_DB=hoblog
POSTGRES_USER=hoblog
POSTGRES_PASSWORD=hoblog
POSTGRES_PORT=5432
```

---

# 6. Environment Variables

Create:

* `frontend/.env.example`
* `backend/.env.example`
* `db/.env`

Backend env should include:

```env
DATABASE_URL=postgresql://hoblog:hoblog@localhost:20003/hoblog
PORT=20002
```

Frontend env:

```env
NEXT_PUBLIC_API_URL=http://localhost:20002
```

---

# 7. Backend DB Connection

Configure Prisma so backend connects using:

* PostgreSQL from Docker Compose
* env-based DATABASE_URL

Nest app should boot successfully.

Prisma should be ready for future migrations.

---

# 8. Scripts

Frontend scripts:

* dev
* build
* start
* lint

Backend scripts:

* start:dev
* build
* start:prod
* lint
* test
* test:e2e
* prisma:generate
* prisma:migrate

Do NOT put `nvm use` inside npm scripts.

---

# 9. Testing Conventions

Backend testing files should use:

```txt
*.spec.ts
```

Frontend testing files should use:

```txt
*.test.tsx
```

Do not implement tests yet, but structure should be compatible.

---

# 10. Code Quality

Requirements:

* clean formatting
* no unnecessary comments
* no junk placeholder code
* no overengineering
* no unnecessary abstractions
* production-minded structure
* simple but scalable setup

This should feel like a serious modern project bootstrap.

---

# Final Result Expectations

After setup, the following should work:

1. Start database via Docker Compose
2. Run backend
3. Run frontend

And:

* frontend loads successfully
* backend loads successfully
* `/health` returns `{ "status": "ok" }`
* Prisma connects successfully to PostgreSQL
* Prisma migrations are ready
* project structure is clean and ready for future feature modules

Do NOT explain the plan.

Execute the setup and create the full scaffold.
