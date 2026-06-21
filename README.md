# Personal Finance Tracker

Full-stack personal finance management application — Spring Boot 3 backend,
React frontend, PostgreSQL database, Docker Compose deployment.

## Features

- **JWT Authentication** — stateless HMAC-SHA512, 24h expiry, user-scoped isolation
- **Category Management** — income/expense categories per user
- **Transaction Tracking** — CRUD with soft-delete, dynamic filtering (date, amount, category, sort, pagination)
- **Dashboard** — real-time summary (income/expense/balance), monthly trends, category breakdown
- **Budgets** — set monthly limits per category, track spent percentage
- **CSV Export** — download transactions as CSV
- **API Docs** — Swagger UI at `/swagger-ui.html`

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.4.1, Spring Security, Spring Data JPA |
| Database | PostgreSQL 16, Flyway migrations |
| Frontend | React 19, Vite 5, Tailwind CSS v4, Recharts, React Router 6 |
| Deployment | Docker Compose, nginx |

## Quick Start

```bash
docker compose up -d
```

- Frontend: http://localhost:5174
- API: http://localhost:8081/api
- Swagger: http://localhost:8081/swagger-ui.html

### Seed Data

```bash
# Register
curl -X POST http://localhost:5174/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@test.com","password":"pass123"}'

# Login (save the token)
curl -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Add categories
TOKEN="<accessToken from above>"
curl -X POST http://localhost:5174/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Salary","type":"INCOME","icon":"💰"}'
```

## Run Locally (without Docker)

### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Requires PostgreSQL on port 5432, database `finance_tracker`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Architecture

```
compose.yaml
├── db        — PostgreSQL 16 (port 5433)
├── backend   — Spring Boot 3 (port 8081, platform: linux/amd64 for Apple Silicon)
└── frontend  — nginx serving React SPA (port 5174)
```

### API Design

- **IDs**: `BigSerial` internal PKs for join performance, `UUID` (String) as public resource identifier
- **Auth**: Stateless JWT, no sessions, no CSRF
- **Queries**: Native SQL for dashboard aggregations, JPA Specifications for dynamic transaction search
- **Soft Delete**: Transactions are soft-deleted (`deleted` flag), filtered out from all read paths

## Tests

```bash
cd backend
./mvnw test
```
