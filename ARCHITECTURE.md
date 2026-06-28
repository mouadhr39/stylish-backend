# Architecture

## Overview

The Stylish Backend is a Flask-based REST API with a React frontend dashboard for managing product categories, inventory, and collections.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend Framework | Flask |
| ORM | Flask-SQLAlchemy |
| Authentication | JWT (PyJWT) |
| Database | PostgreSQL |
| Frontend | React + TypeScript + Vite |
| Containerization | None (bare metal) |

---

## Project Structure

```
stylish-backend/
├── server.py              # Flask application entry point
├── auth.py                # JWT authentication module
├── extensions.py          # Flask-SQLAlchemy extension
├── requirements.txt       # Python dependencies
├── startup.sh           # Build & startup script
├── sql/
│   ├── db.schema.sql      # Database schema
│   ├── clean.db.sql       # Database cleanup script
│   ├── sample.user.data.sql # Sample user data
│   ├── sample.shoes.data.sql # Sample product data
│   └── sample.collections.data.sql # Sample collection data
├── app/                   # React frontend
│   ├── src/
│   │   ├── api/client.ts      # API client
│   │   ├── components/        # UI components
│   │   ├── ctx/             # Context providers
│   │   ├── layouts/         # Layout components
│   │   └── routes/          # Page routes
│   ├── package.json
│   └── dist/              # Built static files
└── entities/
    ├── product.py         # Product routes & model
    ├── category.py        # Category routes & model
    └── collection.py      # Collection routes & model
```

---

## Application Flow

### Request Lifecycle
1. Request enters through Flask route in entity blueprints
2. Protected routes decorated with `@EndpointProtectionVerifier`
3. Decorator validates JWT from `Authorization` header
4. Token payload decoded and `user_identity` attached to request
5. Database query executed via SQLAlchemy
6. JSON response returned

---

## Database Schema

### Entity Relationship Diagram
```
+----------------+       +----------------+       +------------------+
|    users       |       |   category     |       |    collection    |
+----------------+       +----------------+       +------------------+
| id (PK)        |       | id (PK)        |       | id (PK)        |
| username (U)   |       | code (U)       |       | code (U)       |
| role           |       | name (U)       |       | name (U)       |
| passwd_hash    |       +----------------+       +------------------+
| name           |                |
| surname        |                |
+----------------+                |
                                |
                         +----------------+
                         |   product      |
                         +----------------+
                         | id (PK)        |
                         | name           |
                         | sku (U)        |
                         | price          |
                         | currency       |
                         | category_code FK |
                         +----------------+
                                |
                         +------------------+
                         | collection_product|
                         +------------------+
                         | collection_id PK FK|
                         | product_id PK FK  |
                         +------------------+
```

---

## Authentication Architecture

### TokenManager Class
- `generateAccessToken(user_id)` - Creates JWT with `type: 'access'`
- `generateRefreshToken(user_id)` - Creates JWT with `type: 'refresh'`
- `verifyAuthToken(request)` - Validates JWT from Authorization header

### Token Payload Structure
```json
{
  "user_id": 1,
  "type": "access|refresh",
  "exp": "timestamp",
  "iat": "timestamp"
}
```

### Password Verification
Uses PostgreSQL `pgcrypto` `crypt()` function for bcrypt hash verification.

---

## API Layer

### Blueprint Organization
| Blueprint | Routes |
|-----------|--------|
| `auth` | /v1/login, /v1/refresh, /v1/verify, /v1/logout |
| `category` | /v1/category (GET, POST, PUT, DELETE) |
| `product` | /v1/product (GET, POST, PUT, DELETE) |
| `collection` | /v1/collection, /v1/collection/products |

Each entity has:
- SQLAlchemy model definition
- Request handlers for CRUD operations
- JSON payload serialization functions

---

## Frontend Integration

The React frontend is built with Vite and served statically by Flask from `app/dist/`.

### API Client (`app/src/api/client.ts`)
Centralized API calls with JWT token management:
- Login/logout handling
- Token refresh on 401 responses
- Request interceptors for Authorization header

### Protected Routes
React Router with authentication guard (`components/ProtectedRoute.tsx`).

---

## Environment Configuration

### Required Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRESQL_DB_URL` | PostgreSQL connection string | - |
| `SECRET_KEY` | Flask secret for sessions | Random hex |
| `JWT_SECRET_KEY` | JWT signing key | Random hex |
| `JWT_ALGORITHM` | JWT algorithm | HS256 |
| `DATETIME_ACCESS_TOKEN_DELTA` | Access token TTL (seconds) | 120 |
| `DATETIME_REFRESH_TOKEN_DELTA` | Refresh token TTL (seconds) | 240 |

---

## Security Considerations

- **CORS**: Enabled with `supports_credentials=True`
- **Cookies**: HttpOnly, Secure, SameSite=Strict
- **Passwords**: bcrypt via PostgreSQL `crypt()`
- **Tokens**: Short-lived (2-4 minutes)
- **Secret Keys**: Must be set in production via environment