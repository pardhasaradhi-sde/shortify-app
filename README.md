# Scalable URL Shortening Platform

This project is a **full-stack URL Shortener application** designed to demonstrate clean backend architecture, real-world HTTP redirection, and seamless frontend–backend integration. It enables users to convert long URLs into short, shareable links while tracking usage and managing entries through a modern web interface.

The system is composed of a **Spring Boot backend** exposing RESTful APIs and a **React-based frontend** that provides an intuitive user experience for creating and managing shortened URLs.

---

## Application Capabilities

### Core Functionality

- **Short URL Generation**  
  Convert long, complex URLs into compact, easy-to-share short links.

- **Real HTTP Redirection**  
  Implements true browser-level redirection using HTTP status code **302 (Found)** and the `Location` response header.

- **URL Management Dashboard**  
  View, organize, and manage all shortened URLs from the frontend interface.

- **URL Deletion**  
  Remove unused or obsolete shortened URLs with a single action.

- **Click Tracking**  
  Each shortened URL maintains a click counter, enabling basic analytics and usage monitoring.

---

## Architectural Highlights

- **Layered Backend Design**  
  Clear separation of concerns using:
  - Controller layer for request handling
  - Service layer for business logic
  - Repository layer for database access

- **DTO-Based Communication**  
  Data Transfer Objects are used to prevent direct exposure of database entities.

- **Optimized Database Access**  
  Indexed columns ensure fast lookup of short codes during redirection.

- **RESTful API Design**  
  Consistent HTTP methods, meaningful status codes, and predictable endpoints.

- **Centralized Exception Handling**  
  Custom exceptions and global handlers improve reliability and debugging.

- **Cross-Origin Support**  
  Global CORS configuration enables smooth communication between frontend and backend.

---

## Technology Stack

### Backend Technologies

- **Java**
- **Spring Boot**
- **Spring Data JPA**
- **Hibernate**
- **PostgreSQL**
- **Lombok**

### Frontend Technologies

- **React** (powered by Vite)
- **JavaScript**
- **Tailwind CSS**
- **Axios**

---

## Project Layout

```text
url-shortener/
├── backend/
│   ├── controller/    # REST API endpoints
│   ├── service/       # Business logic
│   ├── repository/    # Database access
│   ├── model/         # Entity definitions
│   ├── dto/           # Data transfer objects
│   └── config/        # CORS, exception handling, and app configuration
├── frontend/          # React application
├── README.md
└── .gitignore

```

## Backend Implementation Details

- Controllers delegate all business logic to services, keeping request handlers lightweight.
- Services handle URL generation, validation, click tracking, and deletion.
- Repositories use Spring Data JPA for efficient database operations.
- Redirection logic is implemented fully in the backend, with no frontend dependency.
- Proper HTTP status codes are used (201 Created, 404 Not Found, 302 Found).

---

## REST API Endpoints

| Method | Endpoint         | Description                 |
| -----: | ---------------- | --------------------------- |
|   POST | `/api/urls`      | Create a shortened URL      |
|    GET | `/api/urls`      | Retrieve all shortened URLs |
|    GET | `/{shortCode}`   | Redirect to original URL    |
| DELETE | `/api/urls/{id}` | Delete a shortened URL      |

---

## Redirection Workflow

When accessing a shortened URL:

http://localhost:8080/AbC123xy

- Extracts the short code from the request
- Finds the original URL in the database
- Increments click count
- Returns **302 Found** with `Location` header
- Browser redirects automatically

---

## Running the Application Locally

### Prerequisites

- Java 21+
- Maven
- Node.js
- PostgreSQL

### Start Backend

```bash
cd backend
mvn spring-boot:run
Backend runs at: http://localhost:8080
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:5173
```
