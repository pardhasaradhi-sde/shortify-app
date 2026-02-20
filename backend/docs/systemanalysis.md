# Complete System Deep Dive: URL Shortener

## Table of Contents

1. [System Overview](#system-overview)
2. [Request Flow: Step-by-Step](#request-flow-step-by-step)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Database Design](#database-design)
6. [Security Deep Dive](#security-deep-dive)
7. [Code Walkthrough](#code-walkthrough)

---

## System Overview

### What Does Your System Do?

Your URL shortener is a **full-stack web application** that:

1. **Shortens URLs**: Converts long URLs into short, shareable links
2. **Authenticates Users**: Secure registration and login with JWT
3. **Manages URLs**: Users create, view, and delete their own URLs
4. **Redirects**: Public short links redirect to original URLs

### Technology Stack

**Backend:**

- Spring Boot 3.x (Java framework)
- Spring Security (authentication/authorization)
- Spring Data JPA (database ORM)
- PostgreSQL (relational database)
- Flyway (database migrations)
- JWT (JSON Web Tokens for auth)

**Frontend:**

- React 19 (UI library)
- Vite (build tool)
- React Router (navigation)
- TailwindCSS (styling)
- Fetch API (HTTP requests)

---

## Request Flow: Step-by-Step

### Flow 1: User Registration

```
Browser → Frontend → Backend → Database
```

**Step-by-Step:**

1. **User enters email/password** in RegisterPage
2. **Frontend validates** (password confirmation, length)
3. **Frontend sends POST** to `http://localhost:8080/auth/register`
   ```json
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```
4. **Backend receives** at `AuthController.register()`
5. **AuthService checks** if email already exists
6. **Password is hashed** using BCrypt (one-way encryption)
7. **User entity created** with UUID, email, hashed password
8. **Saved to database** via `UserRepository`
9. **JWT token generated** containing user email
10. **Response sent back** with token
    ```json
    {
      "token": "eyJhbGci...",
      "email": "user@example.com",
      "role": "USER",
      "message": "User registered successfully"
    }
    ```
11. **Frontend stores** token in localStorage
12. **User redirected** to dashboard

---

### Flow 2: User Login

```
Browser → Frontend → Backend → Spring Security → Database
```

**Step-by-Step:**

1. **User enters credentials** in LoginPage
2. **Frontend sends POST** to `/auth/login`
3. **Backend AuthController** receives request
4. **Spring Security's AuthenticationManager** validates:
   - Loads user from database via `CustomUserDetailsService`
   - Compares hashed passwords using BCrypt
5. **If valid:**
   - JWT token generated
   - Token + user info returned
6. **Frontend stores token** and redirects to dashboard

**Security Note:** Password is NEVER stored in plain text. BCrypt creates a one-way hash that can't be reversed.

---

### Flow 3: Creating a Short URL

```
Browser → Frontend → Backend (JWT Check) → Database
```

**Step-by-Step:**

1. **User enters long URL** in dashboard
2. **Frontend sends POST** to `/api/urls` with:
   ```
   Headers: Authorization: Bearer eyJhbGci...
   Body: { "originalUrl": "https://example.com/very/long/url" }
   ```
3. **Request hits backend** at port 8080
4. **CORS filter** checks origin (localhost:5173) - ✅ Allowed
5. **JwtAuthenticationFilter intercepts**:
   - Extracts JWT from Authorization header
   - Validates token signature
   - Checks expiration (24 hours)
   - Extracts user email from token
   - Loads user from database
   - Sets authentication in SecurityContext
6. **Spring Security** checks if endpoint requires auth - ✅ Yes
7. **Request reaches** `UrlController.createShortUrl()`
8. **UrlService.createShortUrl()** executes:
   - Gets current user from SecurityContext
   - Generates random 6-character code via `UrlUtils`
   - Checks if code already exists (collision check)
   - Creates ShortUrl entity with:
     - UUID (primary key)
     - Original URL
     - Short code
     - User reference (foreign key)
     - Timestamps (via @PrePersist)
   - Saves to database
9. **Response sent** with short URL details
10. **Frontend updates** URL list

**Code Generation Logic:**

```java
// UrlUtils.generate()
String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
Random random = new Random();
// Generates 6 random characters
// Example: "aB3xYz"
```

---

### Flow 4: Accessing a Short URL (Public)

```
Browser → Backend → Database → Redirect
```

**Step-by-Step:**

1. **User clicks** `http://localhost:8080/abc123`
2. **Request hits** `RedirectController` (or similar)
3. **No JWT required** - endpoint is public
4. **UrlService.resolveShortUrl("abc123")**:
   - Queries database: `SELECT * FROM short_urls WHERE short_code = 'abc123'`
   - If found: returns original URL
   - If not found: throws `ShortUrlNotFoundException`
5. **Controller redirects** browser to original URL
6. **Browser navigates** to original destination

**Why Public?**
Short URLs must work for anyone, not just logged-in users. That's the whole point!

---

### Flow 5: Deleting a URL

```
Browser → Frontend → Backend (Auth + Ownership Check) → Database
```

**Step-by-Step:**

1. **User clicks Delete** on a URL
2. **Frontend confirms** with popup
3. **Frontend sends DELETE** to `/api/urls/{uuid}` with JWT
4. **Backend authenticates** user via JWT
5. **UrlService.deleteUrl(uuid)**:
   - Gets current user from SecurityContext
   - Finds URL by UUID
   - **Ownership check**: `url.getUser().getId() == currentUser.getId()`
   - If not owner: throws exception
   - If owner: deletes from database
6. **Frontend refreshes** URL list

**Security:** Users can ONLY delete their own URLs. This prevents malicious deletions.

---

## Backend Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│         Controller Layer            │  ← HTTP Endpoints
├─────────────────────────────────────┤
│          Service Layer              │  ← Business Logic
├─────────────────────────────────────┤
│        Repository Layer             │  ← Database Access
├─────────────────────────────────────┤
│       Database (PostgreSQL)         │  ← Data Storage
└─────────────────────────────────────┘
```

### Key Components

#### 1. **Controllers** (Presentation Layer)

**Purpose:** Handle HTTP requests/responses

- **AuthController**: `/auth/register`, `/auth/login`
- **UrlController**: `/api/urls` (CRUD operations)

**Example:**

```java
@PostMapping
public ResponseEntity<ShortUrlDTOResponse> createShortUrl(@RequestBody ShortUrlDTORequest request) {
    ShortUrlDTOResponse response = urlService.createShortUrl(request);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
}
```

**What it does:**

- Receives HTTP request
- Validates input (via `@Valid`)
- Calls service layer
- Returns HTTP response

---

#### 2. **Services** (Business Logic Layer)

**Purpose:** Implement core business rules

- **AuthService**: User registration, login, JWT generation
- **UrlService**: URL creation, retrieval, deletion, ownership checks

**Example:**

```java
public ShortUrlDTOResponse createShortUrl(ShortUrlDTORequest request) {
    // 1. Generate unique code
    String code = generateUniqueCode();

    // 2. Get current user
    User currentUser = getCurrentUser();

    // 3. Create entity
    ShortUrl shortUrl = ShortUrl.builder()
        .originalUrl(request.getOriginalUrl())
        .shortCode(code)
        .user(currentUser)
        .build();

    // 4. Save to database
    ShortUrl saved = shortUrlRepository.save(shortUrl);

    // 5. Return DTO
    return mapToResponse(saved);
}
```

**Why separate from controllers?**

- Reusability: Same logic can be called from different controllers
- Testability: Easy to unit test without HTTP
- Single Responsibility: Controllers handle HTTP, Services handle logic

---

#### 3. **Repositories** (Data Access Layer)

**Purpose:** Database operations

```java
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

**What JPA does:**

- Automatically implements these methods
- Translates to SQL queries
- Handles database connections
- Manages transactions

**Example Query:**

```java
userRepository.findByEmail("user@example.com")
```

**Becomes SQL:**

```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

---

#### 4. **Entities** (Data Models)

**Purpose:** Represent database tables

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    private UUID id;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    @OneToMany(mappedBy = "user")
    private List<ShortUrl> urls;
}
```

**Annotations Explained:**

- `@Entity`: This class maps to a database table
- `@Table(name = "users")`: Table name in database
- `@Id`: Primary key
- `@Column(unique = true)`: Database constraint
- `@OneToMany`: One user has many URLs (relationship)

---

#### 5. **DTOs** (Data Transfer Objects)

**Purpose:** Control what data is sent/received

**Why use DTOs instead of entities?**

- **Security**: Don't expose password hashes
- **Flexibility**: Different views of same data
- **Decoupling**: API structure independent of database

**Example:**

```java
// Entity (database)
class User {
    UUID id;
    String email;
    String passwordHash; // ← Don't send this!
    String role;
}

// DTO (API response)
class AuthResponse {
    String token;
    String email;
    String role;
    String message;
    // No password hash!
}
```

---

### Security Components

#### 1. **JwtUtil** (Token Management)

**Purpose:** Create and validate JWT tokens

**Token Structure:**

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzM5MDM1Nzk1LCJleHAiOjE3MzkxMjIxOTV9.signature
│     Header      │           Payload (Claims)            │  Signature  │
```

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**

```json
{
  "sub": "user@example.com", // Subject (user identifier)
  "iat": 1739035795, // Issued at (timestamp)
  "exp": 1739122195 // Expires at (24 hours later)
}
```

**Signature:**

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

**Why JWT?**

- **Stateless**: No session storage needed
- **Self-contained**: All info in the token
- **Scalable**: Works across multiple servers
- **Secure**: Can't be tampered with (signature validation)

---

#### 2. **JwtAuthenticationFilter** (Request Interceptor)

**Purpose:** Validate JWT on every request

**Flow:**

```
Request → JwtAuthenticationFilter → Controller
          ↓
    1. Extract token from header
    2. Validate signature
    3. Check expiration
    4. Load user from database
    5. Set authentication in SecurityContext
```

**Code:**

```java
@Override
protected void doFilterInternal(HttpServletRequest request,
                                 HttpServletResponse response,
                                 FilterChain filterChain) {
    // 1. Get token from header
    String authHeader = request.getHeader("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String jwt = authHeader.substring(7);

        // 2. Extract email from token
        String userEmail = jwtUtil.extractUsername(jwt);

        // 3. If valid and not already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // 4. Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // 5. Validate token
            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                // 6. Create authentication object
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // 7. Set in SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
    }

    // 8. Continue filter chain
    filterChain.doFilter(request, response);
}
```

---

#### 3. **SecurityConfig** (Security Rules)

**Purpose:** Define which endpoints require authentication

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())  // Disable CSRF for stateless JWT
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/auth/**").permitAll()      // Public: login, register
            .requestMatchers("/{shortCode}").permitAll()  // Public: redirects
            .anyRequest().authenticated())                // Everything else: auth required
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // No sessions
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
```

**What this does:**

- `/auth/**` → Anyone can access
- `/{shortCode}` → Anyone can access (short URL redirects)
- `/api/urls` → Must be authenticated
- No sessions → Stateless (JWT only)
- CORS enabled → Frontend can make requests

---

## Frontend Architecture

### Component Structure

```
App (Router)
├── AuthProvider (Global Auth State)
│   ├── LoginPage
│   ├── RegisterPage
│   └── ProtectedRoute
│       └── DashboardPage
```

### Key Concepts

#### 1. **React Context** (Global State)

**Purpose:** Share authentication state across all components

**Without Context:**

```
App → LoginPage (has user)
App → Dashboard (needs user, must pass as prop)
App → Navbar (needs user, must pass as prop)
```

**With Context:**

```
AuthProvider (stores user)
├── LoginPage (useAuth() → gets user)
├── Dashboard (useAuth() → gets user)
└── Navbar (useAuth() → gets user)
```

**Code:**

```javascript
// Create context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser({ email: data.email, role: data.role });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Use in any component
function Dashboard() {
  const { user, logout } = useAuth();
  return <div>Welcome {user.email}</div>;
}
```

---

#### 2. **React Router** (Navigation)

**Purpose:** Handle client-side routing

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>
```

**How it works:**

- URL changes → React Router matches route → Renders component
- No page reload (Single Page Application)
- Browser back/forward buttons work

---

#### 3. **Protected Routes** (Auth Guard)

**Purpose:** Redirect to login if not authenticated

```javascript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}
```

**Flow:**

1. User tries to access `/dashboard`
2. ProtectedRoute checks if user is logged in
3. If yes: render Dashboard
4. If no: redirect to `/login`

---

#### 4. **API Client** (Centralized HTTP)

**Purpose:** Single place for all backend communication

```javascript
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // Token expired or invalid
    removeToken();
    window.location.href = "/login";
  }

  return response.json();
}
```

**Benefits:**

- Automatic token attachment
- Centralized error handling
- Easy to add logging, retries, etc.

---

## Database Design

### Tables

#### **users**

```sql
CREATE TABLE users (
    id           CHAR(36) PRIMARY KEY,
    email        VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role         VARCHAR(50) DEFAULT 'USER',
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP NOT NULL
);
```

#### **short_urls**

```sql
CREATE TABLE short_urls (
    id           CHAR(36) PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code   VARCHAR(10) UNIQUE NOT NULL,
    user_id      CHAR(36),
    created_at   TIMESTAMP NOT NULL,
    expires_at   TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Relationships

```
users (1) ──────< (many) short_urls
  │                         │
  └─ One user can have many URLs
                            │
                            └─ Each URL belongs to one user
```

**ON DELETE CASCADE:**
If a user is deleted, all their URLs are automatically deleted.

---

## Security Deep Dive

### 1. **Password Security**

**Never store plain text passwords!**

**BCrypt Hashing:**

```java
String plainPassword = "password123";
String hashed = passwordEncoder.encode(plainPassword);
// Result: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

// Verification
boolean matches = passwordEncoder.matches("password123", hashed);  // true
boolean matches = passwordEncoder.matches("wrong", hashed);        // false
```

**Why BCrypt?**

- **One-way**: Can't reverse the hash to get password
- **Salted**: Same password → different hashes (prevents rainbow tables)
- **Slow**: Intentionally slow to prevent brute force
- **Adaptive**: Can increase rounds as computers get faster

---

### 2. **JWT Security**

**Token Validation:**

```java
public boolean isTokenValid(String token, UserDetails userDetails) {
    String username = extractUsername(token);
    return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
}
```

**Checks:**

1. **Signature**: Token hasn't been tampered with
2. **Expiration**: Token is still valid (24 hours)
3. **Subject**: Email matches the user

**Attack Prevention:**

- **Tampering**: Signature validation fails
- **Replay**: Expiration prevents old tokens
- **Theft**: HTTPS prevents interception (in production)

---

### 3. **CORS Security**

**Why needed?**
Browser blocks requests from `localhost:5173` to `localhost:8080` by default (different origins).

**Configuration:**

```java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
configuration.setAllowedMethods(Arrays.asList("GET", "POST", "DELETE"));
configuration.setAllowCredentials(true);
```

**In production:**

```java
configuration.setAllowedOrigins(Arrays.asList("https://yourdomain.com"));
```

---

### 4. **Ownership Checks**

**Prevent unauthorized access:**

```java
public void deleteUrl(UUID id) {
    User currentUser = getCurrentUser();
    ShortUrl url = findById(id);

    // Critical check!
    if (!url.getUser().getId().equals(currentUser.getId())) {
        throw new RuntimeException("Not your URL!");
    }

    delete(url);
}
```

**Without this:**
User A could delete User B's URLs by guessing UUIDs.

---

## Code Walkthrough

### Complete Request Example: Creating a URL

**1. User Action (Frontend)**

```javascript
// DashboardPage.jsx
const handleCreate = async (e) => {
  e.preventDefault();
  const result = await urlApi.create(originalUrl);
  await loadUrls();
};
```

**2. API Call (Frontend)**

```javascript
// services/api.js
export const urlApi = {
  create: async (originalUrl) => {
    return apiRequest("/api/urls", {
      method: "POST",
      body: JSON.stringify({ originalUrl }),
    });
  },
};
```

**3. HTTP Request**

```
POST http://localhost:8080/api/urls
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGci...
Body:
  { "originalUrl": "https://example.com" }
```

**4. Backend Entry Point**

```java
// UrlController.java
@PostMapping
public ResponseEntity<ShortUrlDTOResponse> createShortUrl(
    @RequestBody ShortUrlDTORequest request) {

    ShortUrlDTOResponse response = urlService.createShortUrl(request);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
}
```

**5. Service Logic**

```java
// UrlService.java
public ShortUrlDTOResponse createShortUrl(ShortUrlDTORequest request) {
    // Generate unique code
    String code;
    do {
        code = urlUtils.generate();  // e.g., "aB3xYz"
    } while (shortUrlRepository.existsByShortCode(code));

    // Get authenticated user
    User currentUser = getCurrentUser();

    // Create entity
    ShortUrl shortUrl = ShortUrl.builder()
        .originalUrl(request.getOriginalUrl())
        .shortCode(code)
        .user(currentUser)
        .build();

    // Save to database
    ShortUrl saved = shortUrlRepository.save(shortUrl);

    // Return DTO
    return mapToResponse(saved);
}
```

**6. Database Query (Auto-generated by JPA)**

```sql
INSERT INTO short_urls (id, original_url, short_code, user_id, created_at, expires_at)
VALUES ('uuid-here', 'https://example.com', 'aB3xYz', 'user-uuid', NOW(), NULL);
```

**7. Response**

```json
{
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "originalUrl": "https://example.com",
  "shortUrl": "aB3xYz",
  "clickCount": 0,
  "createdAt": "2026-02-08T23:30:00",
  "expiredAt": null
}
```

**8. Frontend Updates**

```javascript
// DashboardPage.jsx
const loadUrls = async () => {
  const data = await urlApi.getAll();
  setUrls(data); // Re-render with new URL
};
```

---

## Key Takeaways

### What Makes This Production-Ready?

1. **Security First**
   - JWT authentication
   - BCrypt password hashing
   - CORS configured
   - Ownership validation

2. **Clean Architecture**
   - Separation of concerns (Controller → Service → Repository)
   - DTOs for API contracts
   - Reusable components

3. **Database Integrity**
   - Foreign keys (referential integrity)
   - Unique constraints
   - Migrations (version control for database)

4. **User Experience**
   - Protected routes
   - Error handling
   - Loading states
   - Responsive design

### What You've Learned

- **Spring Boot**: Controllers, Services, Repositories, Security
- **JPA/Hibernate**: ORM, entities, relationships
- **JWT**: Token-based authentication
- **React**: Components, Context, Hooks, Router
- **REST APIs**: HTTP methods, status codes, DTOs
- **Database Design**: Normalization, foreign keys, migrations

---

## Next Steps

Now that you understand the system, you're ready to add:

- **Real-time analytics** (WebSockets, async processing)
- **Redis caching** (performance optimization)
- **AI features** (OpenAI integration)
- **Microservices** (scalability)

**You've built a solid foundation. Time to make it extraordinary!** 🚀
