# 💰 HouseXpense (MVP)

A **simple, self-built financial control system** to help me track **all** my expenses and incomes — across multiple accounts, cards, and services — in a single, minimal, web-based dashboard.

---

## 🧠 Why I'm Building This

I've reached a point where I have **too many financial sources**:

Existing apps are either too bloated, too restrictive, or don’t fit my workflow as a developer.  
So I’m building **my own lightweight finance tracker** — something:

- Focused on **clarity, not automation**
- Built **fast**, using tools I already master (NestJS + TypeORM + React + Tailwind)
- Easy to extend later (graphs, analytics, filters, etc.)

---

## 🧩 Core Idea

This project started as a private MVP and is now being hardened for portfolio/public use. The stack is intentionally lean but now ships with a fully containerized runtime that is ready for production-grade hardening.

It’s essentially a **tag-based expense tracker**, with:

- **Users** (for login, eventually multi-user)
- **Movements** (entries for income or expense)
- **Tags** (flexible, per-user categorisation system)
- **Cookie Auth** (HTTP-only access/refresh tokens with rotation)
- **Filtering by tags** to analyze where money goes

### Example use

| Date       | Description          | Type    | Amount  | Tags                                          |
| ---------- | -------------------- | ------- | ------- | --------------------------------------------- |
| 2025-10-26 | Spotify Subscription | Expense | 34.90   | `subscription, luxury, reducible, creditCard` |
| 2025-10-27 | Monthly Wage         | Income  | 120.00  | `wage`                                        |
| 2025-10-28 | Rent                 | Expense | 1000.00 | `rent, housing, bills, wireTransfer`          |

You can later filter:

- All `reducible` expenses → what can I cut?
- All `wage` income → how much I’m earning?
- All `bills` expenses → how much I’m spending on bills?

---

## 🚀 Quick Start (Docker Compose)

### Requirements

- Docker Engine 24+
- Docker Compose v2

### 1. Configure Environment

```bash
cp .env.example .env
```

Update the values in `.env` (especially `POSTGRES_PASSWORD`, `JWT_SECRET`, and the `AUTH_*` cookie settings) before running the stack. See [docs/auth-cookie-strategy.md](docs/auth-cookie-strategy.md) for guidance on the new authentication variables.

### 2. Start the Stack (Production-like)

```bash
docker compose -f docker/docker-compose.yml --env-file .env up --build -d
```

Services:

- Frontend → <http://localhost:${FRONTEND_PORT:-5173}>
- Backend API → <http://localhost:${SERVER_PORT:-3000}/api>
- PostgreSQL (internal only)

### 3. Developer Mode with Hot Reload

```bash
docker compose \
  --env-file .env \
  -f docker/docker-compose.yml \
  -f docker/docker-compose.override.yml \
  up --build
```

This enables live reload for both NestJS and Vite, and exposes PostgreSQL on `${POSTGRES_EXTERNAL_PORT:-5433}` for local tooling.

### 4. Tear Down

```bash
docker compose -f docker/docker-compose.yml down --remove-orphans
# Optional: docker volume rm housexpense_postgres_data
```

---

## 🛠️ Makefile Helpers

For convenience, a top-level `Makefile` wraps the most common Docker Compose tasks. These commands assume a `.env` file at the project root; override with `ENV_FILE` if needed.

```bash
make start        # build + start stack in detached mode
make start-dev    # run with dev override (hot reload, exposed DB)
make stop         # stop containers, keep volumes
make purge        # stop containers and remove volumes/orphans
make logs         # follow service logs
make ps           # list container status
make scan-secrets # run TruffleHog docker scan for potential secrets
```

Example with a custom env file:

```bash
make start ENV_FILE=.env.staging
```

---

## ⚙️ Tech Stack

| Layer                | Technology                        | Notes                                            |
| -------------------- | --------------------------------- | ------------------------------------------------ |
| **Backend**          | NestJS + TypeORM                  | Clean structure, rapid development               |
| **Database**         | PostgreSQL 18 (Docker)            | Secure-by-default (SCRAM, private network)       |
| **Auth**             | HTTP-only cookies + JWT           | Access token (24h) + refresh token (7d) rotation |
| **Frontend**         | React + Tailwind + TanStack Query | Basic dashboard UI                               |
| **Containerization** | Docker + Docker Compose           | One command bootstrap with frontend, backend, DB |
| **Docs**             | Swagger                           | API docs available at `/api/docs`                |

---

## 🏗️ Architecture Overview

Frontend (React, Render)
↓ REST API
Backend (NestJS, Render)
↓ SSL connection
Database (PostgreSQL, Aiven)

All components now run locally (and in CI) via Docker Compose, with the backend communicating with PostgreSQL over a private bridge network. Future hosting (Render, Fly, etc.) can consume the same images produced in Phase 8.

### Backend Architecture – Modular Clean Approach

- **Modular monolith:** Each feature (`auth`, `movements`, `tags`) owns a complete slice with `presentation/`, `application/`, `domain/`, and `infrastructure/` folders. Modules communicate through interfaces/tokens, keeping their internals private.
- **Clean layering:**  
  - Presentation (controllers, presenters, DTOs) handles transport and forwards requests to application use cases.  
  - Application hosts focused use cases that orchestrate domain logic and depend only on abstractions.  
  - Domain contains pure TypeScript models/value objects plus repository interfaces.  
  - Infrastructure implements adapters (TypeORM repositories, strategies) that satisfy domain contracts.
- **Infrastructure seams:** Feature-specific ORM entities were relocated into each module’s `infrastructure/entities/` folder, while shared bootstrapping (TypeORM connection, health endpoints) lives under `infrastructure/database` and `modules/health`.
- **Hexagonal edges:** Infrastructure can be swapped (e.g., different ORM, external gateways) without touching business logic. Presentation never imports TypeORM or persistence entities—the new architecture test guards this boundary.
- **Why this design?** It hits the sweet spot for a mid-sized portfolio project: faster iteration than full DDD, more maintainable than a flat layered service, and ready to grow into advanced patterns (CQRS, events) without rewrites.

---

## 🔐 Authentication & Security

- **Session model:** login/register issue an HTTP-only access token (`access_token` cookie, 24h) and refresh token (`refresh_token` cookie, 7d) alongside a CSRF token cookie. Tokens rotate on each refresh request.
- **Refresh storage:** hashed refresh + CSRF token pairs live in `auth_refresh_tokens`, allowing revocation, audit, and per-device metadata (IP/User-Agent).
- **CSRF & rate limiting:** state-changing auth routes require the `X-CSRF-Token` header to match the CSRF cookie; login/register/refresh/logout are throttled (defaults: 10 requests/minute).
- **Cookie config:** domain/path/secure/same-site attributes are fully environment driven (see `AUTH_COOKIE_*` vars in [docs/auth-cookie-strategy.md](docs/auth-cookie-strategy.md)).
- **Tag privacy:** tags are now scoped per user (`tags.user_id` + unique constraint), ensuring data isolation across sessions.

---

## 🗃️ Database Model

### Entities

#### **User**

| Field       | Type   | Notes                                             |
| ----------- | ------ | ------------------------------------------------- |
| `id`        | UUID   | Primary key                                       |
| `firstName` | string | Required                                          |
| `lastName`  | string | Required                                          |
| `username`  | string | Auto-generated from name (e.g. `matheusjulidori`) |
| `password`  | string | Encrypted with bcrypt                             |
| `createdAt` | date   | Default now()                                     |

#### **Movement**

| Field         | Type                      | Notes             |
| ------------- | ------------------------- | ----------------- |
| `id`          | UUID                      | Primary key       |
| `type`        | enum (`INCOME`/`EXPENSE`) | Defines direction |
| `date`        | date                      | Movement date     |
| `description` | string                    | Expense name      |
| `amount`      | float                     | Positive value    |
| `user`        | relation                  | Belongs to User   |
| `tags`        | many-to-many              | Relation to `Tag` |
| `createdAt`   | date                      | Default now()     |

#### **Tag**

| Field       | Type         | Notes                                               |
| ----------- | ------------ | --------------------------------------------------- |
| `id`        | UUID         | Primary key                                         |
| `name`      | string       | Lowercase, per-user unique constraint (`user_id`)   |
| `user_id`   | UUID         | Owner; cascades on deletion                         |
| `movements` | many-to-many | Relation to `Movement` via `movement_tags`          |
| `createdAt` | date         | Default now()                                       |

#### **auth_refresh_tokens**

| Field            | Type        | Notes                                         |
| ---------------- | ----------- | --------------------------------------------- |
| `id`             | UUID        | Primary key                                   |
| `user_id`        | UUID        | FK to `users` (cascade on delete)             |
| `hashed_token`   | string      | Bcrypt hash of refresh token value            |
| `hashed_csrf_token` | string  | Bcrypt hash of CSRF cookie value              |
| `expires_at`     | timestamptz | Expiry of refresh session                     |
| `revoked_at`     | timestamptz | Populated when token is explicitly revoked    |
| `rotated_at`     | timestamptz | Timestamp of last rotation                    |
| `user_agent`     | string      | Optional device fingerprint                   |
| `ip_address`     | string      | Optional IP audit                             |
| `created_at`     | timestamptz | Audit column                                   |
| `updated_at`     | timestamptz | Audit column                                   |

## 🧰 Dependencies

### Core

```bash
@nestjs/common @nestjs/core @nestjs/platform-express @nestjs/throttler cookie-parser reflect-metadata rxjs
```

### Database

```bash
@nestjs/typeorm typeorm pg
```

### Auth

```bash
@nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
```

### Config & Validation

```bash
@nestjs/config class-validator class-transformer
```

### Docs

```bash
@nestjs/swagger swagger-ui-express
```

---

### 🧾 Environment Variables

All secrets and configuration are sourced from environment variables. Use `.env.example` as the canonical template:

```bash
cp .env.example .env
```

Key values to review before running locally:

- `POSTGRES_PASSWORD` – strong password for the local database
- `JWT_SECRET` – cryptographically strong secret for signing tokens
- `VITE_API_URL` – URL exposed to the frontend (defaults to backend container)
- `BACKEND_LOG_LEVEL` – adjust verbosity (`error`, `warn`, `info`, `debug`, `verbose`)
- `CORS_ORIGIN` – comma-separated list of allowed browser origins (e.g. `http://localhost:5173,http://localhost:3000`)

Validate a specific env file at any time:

```bash
cd server && npm run validate:env -- ../.env.example
```

For production/cloud environments, replicate the same keys in your secrets manager and adjust `DATABASE_URL` to point at your managed PostgreSQL instance (ensure TLS/SSL is enforced).

---

## 🔒 Database Connectivity Notes

- **Local (Docker Compose):** connections terminate inside the private Docker network; SSL is disabled by default but can be enabled by mounting certificates and setting `DB_KEY_PATH`.
- **Managed PostgreSQL (e.g., Aiven, RDS):** keep `DATABASE_URL` with `sslmode=require` and provide `DB_KEY_PATH` / CA bundle if the provider requires certificate pinning.

---

## 🛡️ Secret Scanning

Run automated secret detection before committing or pushing changes:

```bash
make scan-secrets
```

The target launches the official TruffleHog container against the repository and fails on potential leaks. Rotate exposed credentials immediately and keep secret material out of version control.

---

## 🤝 Contributing

Fork the repository, follow the quality rules in [`docs/code-quality-guidelines.md`](docs/code-quality-guidelines.md), and submit a Pull Request. Detailed workflow instructions are available in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📈 Future Improvements

- Monthly summaries
- Expense vs income ratios
- Data export (CSV / JSON)
- Dashboard with charts
- Investments tracking

---

## 💬 Philosophy

> “Build fast. Solve my problem. Improve later.”

This project is an experiment in **speed and pragmatism** — the opposite of over-engineering.
No idealistic bullshit, just a simple, fast, and pragmatic solution to a problem I have that can be useful for others.

---

## 👨‍💻 Author

**Matheus Julidori**
[https://julidori.dev](https://julidori.dev)
[https://linkedin.com/in/matheusjulidori](https://linkedin.com/in/matheusjulidori)
