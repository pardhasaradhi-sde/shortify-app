# Shortify — Full-Stack URL Shortener

A production-grade URL shortener built with **Spring Boot 4** and **React 19**. Shortify turns long URLs into fast, shareable short links and gives you a real-time analytics dashboard to track every click — broken down by country, browser, OS, and daily trend.

---

## ✨ Features

| Feature | Details |
|---|---|
| **URL Shortening** | Convert any URL into an 8-character short code |
| **Custom Aliases** | Optionally set your own slug (e.g. `/my-brand`) |
| **Sub-10ms Redirects** | Redis cache layer sits in front of every redirect |
| **JWT Authentication** | Stateless auth — register, login, and all URLs are private by default |
| **Click Analytics** | Total clicks, unique visitors, breakdown by country / browser / OS, 30-day time series |
| **Async Click Recording** | Redirect returns immediately; analytics are written on a background thread — zero latency impact |
| **GeoIP Lookup** | Country code resolved per click via ip-api.com (no API key required) |
| **QR Code Generation** | On-demand PNG QR codes for any short link, downloadable from the dashboard |
| **Sliding-Window Rate Limiting** | Per-user limits on URL creation and API calls; per-IP limits on redirects — enforced via Redis |
| **Flyway Migrations** | Schema versioned and migrated automatically on startup |
| **Animated Landing Page** | Particle background, animated counters, feature cards, step-by-step guide |
| **Responsive Dashboard** | Create links, view all URLs, copy, delete, open analytics modal, download QR |

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Java 21, Spring Boot 4 |
| Web | Spring MVC (REST) |
| Security | Spring Security + JWT (JJWT 0.12), BCrypt |
| Database | PostgreSQL 16, Spring Data JPA, Hibernate |
| Migrations | Flyway |
| Cache / Rate-limit store | Redis 7 (Spring Data Redis) |
| QR Codes | ZXing 3.5 |
| Build | Maven |
| Utilities | Lombok |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP | Fetch API (custom wrapper) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                  │
│  Landing · Dashboard · Analytics Modal · QR Modal       │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP + JWT Bearer
┌──────────────────────────▼──────────────────────────────┐
│                Spring Boot API (:8080)                   │
│                                                         │
│  JwtAuthFilter → SecurityFilterChain                    │
│  RateLimitInterceptor (Redis sliding-window)            │
│                                                         │
│  AuthController   /auth/register  /auth/login           │
│  UrlController    /api/urls  (CRUD, owner-scoped)       │
│  RedirectController  /{shortCode}  → 302 Found          │
│  AnalyticsController /api/urls/{code}/analytics         │
│  QrCodeController    /api/urls/{code}/qr                │
│  CacheController     /admin/cache/**  (ADMIN role)      │
│                                                         │
│  ClickRecordedEvent ──@Async──► ClickEventListener      │
│                                    │ GeoIP · UA parse   │
│                                    ▼                    │
│                             ClickEvent (DB)             │
└────────────┬───────────────────────────────┬────────────┘
             │                               │
    ┌────────▼────────┐             ┌────────▼────────┐
    │   PostgreSQL    │             │      Redis      │
    │  users          │             │  URL cache      │
    │  short_urls     │             │  Rate-limit     │
    │  click_events   │             │  counters       │
    └─────────────────┘             └─────────────────┘
```

### Key Design Decisions

- **Non-blocking analytics** — `RedirectController` publishes a `ClickRecordedEvent` via Spring's `ApplicationEventPublisher`. An `@Async` listener resolves the GeoIP, parses the User-Agent, and writes the `ClickEvent` row. The user's 302 redirect is returned before any of this starts.
- **Redis cache** — short code → original URL mappings are cached with a 24-hour TTL. Cache is invalidated on URL deletion.
- **Sliding-window rate limiter** — implemented entirely in Redis. Three independent limits: URL creation (10/hour per user), redirects (100/minute per IP), general API (1000/hour per user).
- **DTO boundary** — entities never leave the service layer; all responses use dedicated DTOs.
- **Flyway owns the schema** — `ddl-auto: validate` in both dev and prod. Migrations live in `src/main/resources/db/migration`.

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new account |
| `POST` | `/auth/login` | Public | Login and receive a JWT |

### URLs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/urls` | ✅ | Create a short URL (optional `customAlias`) |
| `GET` | `/api/urls` | ✅ | List all URLs for the current user |
| `DELETE` | `/api/urls/{id}` | ✅ | Delete a URL (owner only) |
| `GET` | `/{shortCode}` | Public | Redirect to original URL (302) |

### Analytics & QR

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/urls/{shortCode}/analytics` | ✅ | Full analytics report |
| `GET` | `/api/urls/{shortCode}/qr` | Public | PNG QR code (`?size=300`) |

### Cache Admin *(ADMIN role)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/cache/stats` | Cache hit/miss stats |
| `DELETE` | `/admin/cache/clear` | Flush all cached URLs |
| `DELETE` | `/admin/cache/{shortCode}` | Invalidate one entry |

#### Analytics Response Shape

```json
{
  "shortCode": "aB3xY7qZ",
  "originalUrl": "https://example.com/very/long/path",
  "totalClicks": 1420,
  "uniqueVisitors": 843,
  "clicksByCountry": [{ "label": "IN", "count": 620 }, { "label": "US", "count": 310 }],
  "clicksByBrowser": [{ "label": "Chrome", "count": 900 }],
  "clicksByOs":      [{ "label": "Windows", "count": 750 }],
  "clicksOverTime":  [{ "date": "2026-02-01", "count": 42 }]
}
```

---

## 📁 Project Structure

```
urlshortener/
├── backend/
│   ├── src/main/java/com/example/url_shortener/
│   │   ├── controller/         # AuthController, UrlController, RedirectController,
│   │   │                       # AnalyticsController, QrCodeController, CacheController
│   │   ├── service/            # AuthService, UrlService, AnalyticsService,
│   │   │                       # QrCodeService, RateLimitService
│   │   ├── events/             # ClickRecordedEvent, ClickEventListener (@Async)
│   │   ├── model/              # User, ShortUrl, ClickEvent
│   │   ├── repository/         # JPA repositories + JPQL analytics queries
│   │   ├── dtos/               # Request/response DTOs (auth, url, analytics)
│   │   ├── security/           # JwtUtil, JwtAuthenticationFilter
│   │   ├── config/             # SecurityConfig, RateLimitInterceptor, RateLimitConfig
│   │   └── exception/          # GlobalExceptionHandler, custom exceptions
│   └── src/main/resources/
│       ├── application.yml     # Dev config (env-var driven)
│       └── db/migration/       # V1…V4 Flyway SQL migrations
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── landing/        # Animated landing page
        │   ├── dashboard/      # Main app — URL list, create panel, modals
        │   ├── login/
        │   └── register/       # With password-strength indicator
        ├── components/
        │   ├── ui/             # GlowButton, GlassCard, Toast, Particles, AnimatedCounter
        │   └── layout/         # Navbar
        ├── services/api.js     # Typed API client + JWT token management
        └── context/AuthContext.jsx
```

---

## 🚀 Running Locally

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+ running locally
- Redis 7+ running locally

### 1. Backend

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE url_shortener;"

cd backend
mvn spring-boot:run
# API available at http://localhost:8080
```

The default `application.yml` connects to `localhost:5432/url_shortener` with user `postgres` / password `postgres`. Override with env vars if needed:

```bash
DB_URL=jdbc:postgresql://localhost:5432/url_shortener \
DB_USERNAME=postgres \
DB_PASSWORD=postgres \
REDIS_HOST=localhost \
JWT_SECRET=dev-secret-change-this-in-production \
mvn spring-boot:run
```

Flyway runs automatically and creates all tables on first start.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

Create a `frontend/.env` file if your backend runs on a non-default port:

```env
VITE_API_URL=http://localhost:8080
```

---

## 🔒 Security Notes

- All `/api/**` endpoints require a valid `Authorization: Bearer <token>` header
- Passwords are hashed with BCrypt
- JWT is stateless — no server-side sessions
- CORS origins are configurable via `CORS_ALLOWED_ORIGINS` env var
- Rate limits are returned to clients via standard headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`
- The `/{shortCode}` redirect endpoint and `/api/urls/{code}/qr` are intentionally public
