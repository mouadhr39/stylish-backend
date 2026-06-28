# API Specification

## Base URL
```
http://localhost:5000/v1
```

## Authentication

### Token-Based Authentication
The API uses JWT (JSON Web Token) authentication with access and refresh tokens.

| Token Type | Duration (default) | Header Format |
|------------|------------------|---------------|
| Access Token | 2 minutes (120s) | `Bearer <token>` |
| Refresh Token | 4 minutes (240s) | `Bearer <token>` |

### Authentication Flow
1. Obtain tokens via `POST /login`
2. Include access token in `Authorization` header for protected endpoints
3. Refresh expired access tokens via `POST /refresh`
4. Verify token validity via `POST /verify`

---

## Authentication Endpoints

### Login
`POST /login`

Authenticates a user and returns access/refresh tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "username": "string",
    "role": "string",
    "name": "string",
    "surname": "string"
  }
}
```

**Response (401):**
```json
{
  "status": "error",
  "code": 401,
  "name": "Unauthorized",
  "description": "Invalid username or password."
}
```

---

### Refresh Token
`POST /refresh`

Generates a new access token using a valid refresh token.

**Request Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response (200):**
```json
{
  "access_token": "string"
}
```

**Response (401):**
```json
{
  "status": "error",
  "code": 401,
  "name": "Unauthorized",
  "description": "Invalid token type."
}
```

---

### Verify Token
`POST /verify`

Verifies if the provided access token is valid.

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "result": true,
  "message": "Token is valid"
}
```

---

### Logout
`POST /logout`

Clears session cookies.

**Response (200):**
```json
{
  "message": "Logout effettuato con successo"
}
```

---

## Category Endpoints

### Get All Categories
`GET /category`

**Response (200):**
```json
[
  {
    "id": 1,
    "code": "string",
    "name": "string"
  }
]
```

---

### Create Category
`POST /category`

*Requires authentication*

**Request Body:**
```json
{
  "code": "string",
  "name": "string"
}
```

**Response (201):**
```json
{
  "id": 1,
  "code": "string",
  "name": "string"
}
```

**Response (400):** Missing required fields

**Response (409):** Category already exists

---

### Update Category
`PUT /category/<category_code>`

*Requires authentication*

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (200):**
```json
{
  "id": 1,
  "code": "string",
  "name": "string"
}
```

**Response (404):** Category not found

---

### Delete Category
`DELETE /category/<category_code>`

*Requires authentication*

**Response (204):** No content

---

## Product Endpoints

### Get All Products
`GET /product`

Returns all products grouped by category.

**Response (200):**
```json
{
  "CategoryName": [
    {
      "id": 1,
      "name": "string",
      "sku": "string",
      "price": 0.00,
      "currency": "USD",
      "category_code": "string",
      "inStock": true,
      "rating": 0.0,
      "reviews": 0,
      "imagePath": "string"
    }
  ]
}
```

---

### Get Products by Category
`GET /product/<category_code>`

**Response (200):**
```json
{
  "id": 1,
  "name": "string",
  "code": "string",
  "products": [...]
}
```

**Response (404):** Category not found or no products

---

### Get Product by SKU
`GET /product/<sku>`

**Response (200):**
```json
{
  "id": 1,
  "name": "string",
  "sku": "string",
  "price": 0.00,
  "currency": "USD",
  "category_code": "string",
  "inStock": true,
  "rating": 0.0,
  "reviews": 0,
  "imagePath": "string"
}
```

**Response (404):** Product not found

---

### Create Product
`POST /product`

*Requires authentication*

**Request Body:**
```json
{
  "name": "string",
  "sku": "string",
  "price": 0.00,
  "currency": "USD",
  "category_code": "string",
  "in_stock": true,
  "rating": 0.0,
  "reviews": 0,
  "image_path": "string"
}
```

**Response (201):** Product object

---

### Update Product
`PUT /product/<product_id>`

*Requires authentication*

**Request Body:** Partial product object (any fields can be updated)

---

### Delete Product
`DELETE /product/<product_id>`

*Requires authentication*

**Response (204):** No content

---

## Collection Endpoints

### Get All Collections
`GET /collection`

**Response (200):**
```json
[
  {
    "id": 1,
    "code": "string",
    "name": "string"
  }
]
```

---

### Create Collection
`POST /collection`

*Requires authentication*

**Request Body:**
```json
{
  "code": "string",
  "name": "string"
}
```

**Response (201):** Collection object

---

### Update Collection
`PUT /collection/<collection_code>`

*Requires authentication*

**Request Body:**
```json
{
  "name": "string"
}
```

---

### Delete Collection
`DELETE /collection/<collection_code>`

*Requires authentication*

---

### Get Collection Products
`GET /collection/<collection_code>/products`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "string",
    "sku": "string",
    "price": 0.00,
    "currency": "USD",
    "inStock": true,
    "rating": 0.0,
    "reviews": 0,
    "imagePath": "string"
  }
]
```

---

### Add Product to Collection
`POST /collection/<collection_code>/products`

*Requires authentication*

**Request Body:**
```json
{
  "sku": "string"
}
```

**Response (201):**
```json
{
  "message": "Product added to collection"
}
```

---

### Remove Product from Collection
`DELETE /collection/<collection_code>/products/<product_sku>`

*Requires authentication*

**Response (200):**
```json
{
  "message": "Product removed from collection"
}
```

---

## Error Responses

All error responses follow this structure:

```json
{
  "status": "error",
  "code": 400,
  "name": "Bad Request",
  "description": "Error description"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Successful request |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |

---

## Data Models

### Category
| Field | Type | Required |
|-------|------|----------|
| id | integer | Auto |
| code | string (50) | Yes, unique |
| name | string (255) | Yes, unique |

### Product
| Field | Type | Required |
|-------|------|----------|
| id | integer | Auto |
| name | string (255) | Yes |
| sku | string (50) | Yes, unique |
| price | decimal (10,2) | Yes |
| currency | string (10) | Yes, default: USD |
| category_code | string (50) | Yes, FK to category |
| in_stock | boolean | Default: true |
| rating | decimal (2,1) | Default: 0.0 |
| reviews | integer | Default: 0 |
| image_path | string (255) | Optional |

### Collection
| Field | Type | Required |
|-------|------|----------|
| id | integer | Auto |
| code | string (50) | Yes, unique |
| name | string (255) | Yes, unique |

### User
| Field | Type | Required |
|-------|------|----------|
| id | integer | Auto |
| username | string (255) | Yes, unique |
| role | string (255) | Yes |
| passwd_hash | string (255) | Yes |
| name | string (255) | Optional |
| surname | string (255) | Optional |