# JobFy v2

[![CI](https://github.com/EduardMilitaruG/JobFy-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/EduardMilitaruG/JobFy-v2/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

A full-stack job scraper dashboard built as a TypeScript monorepo. Scrapes job listings from 5 portals, stores them in PostgreSQL, and displays them through a React dashboard with charts, filtering, and real-time scrape status.

> Rebuilt from scratch from [JobFy v1](https://github.com/EduardMilitaruG/JobFy) (Python CLI) to a production-grade TypeScript monorepo.

---

## Features

- **Multi-source scraping** — RemoteOK, Tecnoempleo, InfoJobs, LinkedIn, Indeed
- **Async scraping** — fire-and-forget with live status polling (no page blocking)
- **Duplicate prevention** — database-level `UNIQUE` constraint on job links
- **Search & filter** — debounced search, source filter, paginated results
- **Stats dashboard** — charts by source, company, skills, and location (Recharts)
- **Full Docker setup** — one command to run the whole stack locally
- **CI/CD pipeline** — lint → unit tests → integration tests → E2E → Docker build

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Recharts, CSS custom properties |
| Backend | Node.js, Express, TypeScript, Pino |
| Database | PostgreSQL 16, Prisma ORM |
| Validation | Zod (shared between frontend and backend) |
| Scraping | Axios + Cheerio |
| Testing | Jest, Supertest, React Testing Library, Cypress |
| Infrastructure | Docker, Docker Compose, GitHub Actions |
| Architecture | npm workspaces monorepo |

---

## Project Structure

```
JobFy-v2/
├── packages/
│   ├── shared/          # Shared TypeScript types, Zod schemas, constants
│   ├── backend/         # Express REST API + scrapers
│   │   ├── prisma/      # Schema and migrations
│   │   ├── src/
│   │   │   ├── config/       # Env validation, site configs
│   │   │   ├── middleware/    # Error handler, request validator, logger
│   │   │   ├── routes/        # jobs, stats, scrape, sites
│   │   │   ├── services/      # Business logic layer
│   │   │   └── scrapers/      # Base + 5 site-specific scrapers
│   │   └── __tests__/   # Unit + integration tests with fixtures
│   └── frontend/        # React SPA
│       ├── src/
│       │   ├── components/    # 18 focused components
│       │   ├── hooks/         # useJobs, useStats, useScrape, useDebounce
│       │   └── services/      # API client layer
│       └── cypress/     # E2E tests
├── docker-compose.yml        # Development stack
├── docker-compose.prod.yml   # Production stack (multi-stage builds + nginx)
└── .github/workflows/ci.yml  # Full CI pipeline
```

---

## Getting Started

### With Docker (recommended)

```bash
git clone https://github.com/EduardMilitaruG/JobFy-v2.git
cd JobFy-v2
docker compose up
```

Open [http://localhost:5173](http://localhost:5173)

### Manual setup

Requirements: Node.js 20+, PostgreSQL 16

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp packages/backend/.env.example packages/backend/.env
# Edit DATABASE_URL in packages/backend/.env

# 3. Build shared package and generate Prisma client
npm run build -w packages/shared
cd packages/backend && npx prisma migrate dev && cd ../..

# 4. Start backend and frontend (separate terminals)
npm run dev:backend
npm run dev:frontend
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/jobs` | List jobs (search, source, limit, offset) |
| `GET` | `/api/jobs/:id` | Get single job |
| `DELETE` | `/api/jobs/:id` | Delete job |
| `DELETE` | `/api/jobs` | Clear all jobs |
| `GET` | `/api/stats` | Aggregated stats |
| `GET` | `/api/sites` | Available scraper sites |
| `POST` | `/api/scrape` | Start scrape job |
| `GET` | `/api/scrape/logs` | Scrape history |

---

## Testing

```bash
# All tests
npm test

# Backend only (unit + integration, requires PostgreSQL)
npm test -w packages/backend

# Frontend only (component tests)
npm test -w packages/frontend

# E2E (requires running backend + frontend)
npm run cypress:run -w packages/frontend
```

**Test coverage:**
- Backend services tested against real PostgreSQL (not mocked)
- HTTP layer tested with Supertest using the app factory pattern
- Scraper parsers tested with fixture HTML files
- React components tested with React Testing Library
- E2E flows tested with Cypress using `cy.intercept()` for deterministic results

---

## CI Pipeline

```
lint + typecheck → test-backend ──┬── e2e → build-docker
                → test-frontend ──┘
```

Backend and frontend tests run in parallel. E2E tests spin up both services against a real PostgreSQL instance.

---

## Key Design Decisions

- **Monorepo with npm workspaces** — shared Zod schemas and TypeScript types prevent API contract drift between frontend and backend
- **App factory pattern** — `createApp()` returns a configured Express app without binding to a port, making Supertest integration testing clean and port-conflict-free
- **Unique constraint over SELECT-then-INSERT** — duplicate job prevention at the database level is race-condition safe
- **Fire-and-forget scraping** — `POST /api/scrape` returns immediately; frontend polls `/api/scrape/logs` every 5 seconds for status updates
- **Fixture-based scraper tests** — parser logic tested with saved HTML files, not live network calls

---

## License

MIT
