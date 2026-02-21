# Shortify — URL Shortener

A production-grade URL shortener built with Spring Boot 3 and React 19. Shortify converts long URLs into short links and provides a real-time analytics dashboard tracking every click by browser, OS, and daily trend.

Live: [shortify-now.vercel.app](https://shortify-now.vercel.app) — Backend: [urlshortener-springboot.onrender.com](https://urlshortener-springboot.onrender.com)

---

## Features

| Feature | Details |
|---|---|
| URL Shortening | Converts any URL into an 8-character short code |
| Custom Aliases | Optionally provide your own slug |
| Sub-10ms Redirects | Redis cache in front of every redirect |
| JWT Authentication | Stateless auth — all URLs are private by default |
| Click Analytics | Total clicks, unique visitors, browser / OS breakdown, 30-day time series |
| Async Click Recording | Redirect returns immediately; analytics written on a background thread |
| QR Code Generation | On-demand PNG QR codes, downloadable from the dashboard |
| Sliding-Window Rate Limiting | Per-user limits on URL creation and API calls; per-IP limits on redirects |
| Flyway Migrations | Schema versioned and applied automatically on startup |

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Java 21, Spring Boot 3.4 |
| Security | Spring Security, JJWT 0.12, BCrypt |
| Database | PostgreSQL, Spring Data JPA, Hibernate |
| Migrations | Flyway |
| Cache / Rate limiting | Redis 7 via Spring Data Redis (Lettuce) |
| QR Codes | ZXing 3.5 |
| Build | Maven |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19, Vite 7 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion 12 |
| Charts | Recharts 3 |
| Icons | Lucide React |

---

## Architecture

```
React Frontend (Vite)
  Landing / Dashboard / Analytics / QR
         |
         | HTTP + JWT Bearer
         |
Spring Boot API (:8080)
  JwtAuthFilter
  RateLimitInterceptor
  AuthController      /auth/register  /auth/login
  UrlController       /api/urls  (CRUD, owner-scoped)
  RedirectController  /{shortCode}  -> 302
  AnalyticsController /api/urls/{code}/analytics
  QrCodeController    /api/urls/{code}/qr
         |
         |-- ClickRecordedEvent --@Async--> ClickEventListener
         |                                    GeoIP + UA parse
         |                                    ClickEvent (DB)
         |
    PostgreSQL                    Redis
    users                         URL cache (24h TTL)
    short_urls                    Rate-limit sliding windows
    click_events
```

### Key Design Decisions

- **Non-blocking analytics** — `RedirectController` publishes a `ClickRecordedEvent` via Spring's `ApplicationEventPublisher`. An `@Async` listener resolves the GeoIP, parses the User-Agent, and writes the `ClickEvent` row after the 302 has already been returned.
- **Redis cache** — short code to original URL mappings are cached with a 24-hour TTL and invalidated on deletion.
- **Sliding-window rate limiter** — implemented in Redis. Three independent limits: URL creation (10/hour per user), redirects (100/minute per IP), general API (1000/hour per user).
- **DTO boundary** — entities never leave the service layer; all controller responses use dedicated DTOs.
- **Flyway owns the schema** — `ddl-auto: validate` in both dev and prod. Migrations live in `src/main/resources/db/migration`.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new account |
| POST | `/auth/login` | Public | Login and receive a JWT |

### URLs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/urls` | Required | Create a short URL (optional `customAlias`) |
| GET | `/api/urls` | Required | List all URLs for the authenticated user |
| DELETE | `/api/urls/{id}` | Required | Delete a URL (owner only) |
| GET | `/{shortCode}` | Public | Redirect to original URL (302) |

### Analytics and QR

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/urls/{shortCode}/analytics` | Required | Full analytics report |
| GET | `/api/urls/{shortCode}/qr` | Public | PNG QR code (`?size=300`) |

### Cache Admin (ADMIN role only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/cache/stats` | Cache hit/miss stats |
| DELETE | `/admin/cache/clear` | Flush all cached entries |
| DELETE | `/admin/cache/{shortCode}` | Invalidate a single entry |

---

## Project Structure

```
urlshortener/
├── docker-compose.yml              # Local full-stack: Redis + backend + frontend
├── backend/
│   ├── Dockerfile
│   ├── src/main/java/com/example/url_shortener/
│   │   ├── controller/             # Auth, Url, Redirect, Analytics, QrCode, Cache
│   │   ├── service/                # Auth, Url, Analytics, QrCode, RateLimit
│   │   ├── events/                 # ClickRecordedEvent, ClickEventListener
│   │   ├── model/                  # User, ShortUrl, ClickEvent
│   │   ├── repository/             # JPA repositories + JPQL analytics queries
│   │   ├── dtos/                   # Request/response DTOs
│   │   ├── security/               # JwtUtil, JwtAuthenticationFilter
│   │   ├── config/                 # SecurityConfig, RateLimitInterceptor, RedisConfig
│   │   └── exception/              # GlobalExceptionHandler
│   └── src/main/resources/
│       ├── application.yml         # Dev config
│       ├── application-prod.yml    # Production config (env-var driven)
│       └── db/migration/           # V1-V6 Flyway SQL migrations
└── frontend/
    ├── Dockerfile.dev
    └── src/
        ├── pages/
        │   ├── landing/            # Animated landing page
        │   ├── dashboard/          # URL list, create panel, analytics modal, QR modal
        │   ├── login/
        │   └── register/           # With password strength indicator
        ├── components/
        │   ├── ui/                 # GlowButton, GlassCard, Toast, Particles, AnimatedCounter
        │   └── layout/             # Navbar
        ├── services/api.js         # API client with JWT injection
        └── context/AuthContext.jsx
```

---

## Running Locally

The entire stack (Redis, backend, frontend) starts with a single command. PostgreSQL is expected to be running on your machine.

### Prerequisites

- Docker Desktop
- PostgreSQL running locally with a database named `url_shortener`

### Start

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

### Stop

```bash
docker compose down
```

The first run takes 3-5 minutes while Maven downloads dependencies and compiles the JAR. Subsequent starts are instant.

### Without Docker

```bash
# Terminal 1 — backend
cd backend
mvn spring-boot:run

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Required env vars for the backend (defaults in `application.yml` match local dev conventions):

```
DB_URL=jdbc:postgresql://localhost:5432/url_shortener
DB_USERNAME=postgres
DB_PASSWORD=<your password>
REDIS_HOST=localhost
JWT_SECRET=<min 32 characters>
APP_BASE_URL=http://localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Deployment

### Backend — Render

Deployed as a Docker container. Required environment variables in the Render dashboard:

| Variable | Description |
|---|---|
| `DB_URL` | Supabase session pooler JDBC URL |
| `DB_USERNAME` | Supabase DB username |
| `DB_PASSWORD` | Supabase DB password |
| `REDIS_HOST` | Upstash Redis hostname |
| `REDIS_PORT` | `6379` |
| `REDIS_PASSWORD` | Upstash Redis password |
| `REDIS_SSL` | `true` |
| `JWT_SECRET` | Min 32-character secret |
| `APP_BASE_URL` | `https://your-service.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |

### Frontend — Vercel

Connect the GitHub repo, set root directory to `frontend`, and add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-service.onrender.com` |

---

## Security Notes

- All `/api/**` endpoints require a valid `Authorization: Bearer <token>` header
- Passwords are hashed with BCrypt
- JWT is stateless — no server-side sessions
- CORS origins are configurable via the `CORS_ALLOWED_ORIGINS` environment variable
- Rate limit headers returned on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`
- The `/{shortCode}` redirect and `/api/urls/{code}/qr` endpoints are intentionally public
