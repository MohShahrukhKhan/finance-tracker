# Personal Finance Tracker

Full-stack personal finance management application — Spring Boot 3 backend,
React frontend, PostgreSQL database, Docker Compose deployment.

## Features

- **JWT Authentication** — HMAC-SHA512 tokens, 24h expiry, user-scoped isolation
- **Category Management** — income/expense categories per user
- **Transaction Tracking** — CRUD with soft-delete, dynamic filtering (date, amount, category, sort, pagination)
- **Dashboard** — real-time summary (income/expense/balance), monthly trends, category breakdown
- **Budgets** — set monthly limits per category, track spent percentage
- **CSV Export** — download transactions as CSV
- **Password Reset** — forgot/reset password flow with email-based token (token logged to console in dev)
- **OAuth2 Login** — "Sign in with GitHub" (set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` env vars)
- **Integration Tests** — Testcontainers-based tests against real PostgreSQL
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
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@test.com","password":"pass123"}'

# Login (save the token)
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

# Add categories
curl -X POST http://localhost:8081/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Salary","type":"INCOME","icon":"💵"}'

curl -X POST http://localhost:8081/api/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Food","type":"EXPENSE","icon":"🍕"}'

# Add transactions
curl -X POST http://localhost:8081/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":50000,"note":"June salary","transactionDate":"2026-06-01","categoryId":"<income-category-uuid>"}'

curl -X POST http://localhost:8081/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":1500,"note":"Groceries","transactionDate":"2026-06-05","categoryId":"<expense-category-uuid>"}'

# Add budget
curl -X POST http://localhost:8081/api/budgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"<expense-category-uuid>","limitAmount":10000,"month":"2026-06-01"}'
```

### Password Reset (Dev)

In development, the reset token is logged to the backend console:

```bash
# Request reset
curl -X POST http://localhost:8081/api/auth/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'

# Check backend logs for the reset URL
docker logs ft-backend 2>&1 | grep "Reset URL"

# Reset password with the token from the log
curl -X POST http://localhost:8081/api/auth/password/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-logs>","newPassword":"newpass"}'
```

### GitHub OAuth2

1. Create a GitHub OAuth App at https://github.com/settings/developers
   - Homepage URL: `http://localhost:5174`
   - Authorization callback URL: `http://localhost:8081/login/oauth2/code/github`

2. Set environment variables and restart:
   ```bash
   GITHUB_CLIENT_ID=your_client_id GITHUB_CLIENT_SECRET=your_client_secret docker compose up -d
   ```

3. Click "Sign in with GitHub" on the login page.

## Run Locally (without Docker)

### Backend

```bash
cd backend
./mvnw spring-boot:run
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
├── backend   — Spring Boot 3 (port 8081)
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

# Unit tests (22 tests, Mockito + JUnit 5)
mvn test

# Integration tests (8 tests, Testcontainers + real PostgreSQL)
mvn verify -DincludeGroups=integration

# All tests (unit + integration)
mvn verify

# CI run (unit tests only, skips integration)
mvn verify -DexcludeGroups=integration
```
