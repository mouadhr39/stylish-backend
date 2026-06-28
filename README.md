# Stylish Backend

A Flask-based/React.js REST v1 for managing product categories and inventory.

## Prerequisites

### 1. PostgreSQL Installation and Setup

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew)
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
- Download and install PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- Remember the password you set for the `postgres` user during installation

### 2. Database Configuration

After installing PostgreSQL, create a database and user for the application:

```bash
# Connect to PostgreSQL as the postgres user
sudo -u postgres psql

# Inside the PostgreSQL prompt, run:
CREATE DATABASE stylishdb;
CREATE USER stylishuser WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE stylishdb TO stylishuser;
\c stylishdb
GRANT ALL PRIVILEGES ON SCHEMA public TO stylishuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO stylishuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO stylishuser;
\q
```

Replace `your_strong_password` with a secure password.

### 3. Environment Variables

Create a `.env` file in the project root with the following content:

```
POSTGRESQL_DB_URL=postgresql://stylishuser:your_strong_password@localhost:5432/stylishdb
SECRET_KEY=your_flask_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
DATETIME_REFRESH_TOKEN_DELTA=240
DATETIME_ACCESS_TOKEN_DELTA=120
```

For the startup script, you can optionally create a `config.env` file (the script loads this instead of `.env`).

- `POSTGRESQL_DB_URL`: Database connection string
- `SECRET_KEY`: Flask session secret key (required for production)
- `JWT_SECRET_KEY`: Secret key for signing JWT tokens (required for production)
- `JWT_ALGORITHM`: Algorithm used for JWT signing (default: HS256)
- `DATETIME_REFRESH_TOKEN_DELTA`: Refresh token validity in seconds (default: 240)
- `DATETIME_ACCESS_TOKEN_DELTA`: Access token validity in seconds (default: 120)

### 4. Frontend Setup (Optional)

The backend serves a React frontend application for the dashboard UI. If you want to build the frontend from source:

#### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

#### Build the Frontend

```bash
cd app
npm install
npm run build
```

This will build the React app to `app/dist/`, which is then served by the Flask backend. The built files are already included in the repository.

### 5. Python Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 6. Database Initialization

Initialize the database schema and load sample data:

```bash
# Create tables
psql -h localhost -U stylishuser -d stylishdb -f sql/db.schema.sql

# Load sample data (optional)
psql -h localhost -U stylishuser -d stylishdb -f sql/sample.shoes.data.sql
```

## Running the Server

### Using the startup script (Linux/macOS)

For Linux-based systems, use the provided `startup.sh` script:

```bash
# Make it executable
chmod +x startup.sh

# Start the server
./startup.sh

# Start with clean build (--force to remove node_modules and dist before building)
./startup.sh --force
```

The script will:
- Build the frontend if `dist/` doesn't exist
- Install npm dependencies if `node_modules/` doesn't exist
- Start the Flask backend server

### Manual startup

Start the Flask development server:

```bash
python server.py
```

The server will be available at `http://localhost:5000`.

## Authentication

The API uses JWT (JSON Web Token) authentication with access and refresh tokens:

- **Access Token**: Short-lived token (default: 2 minutes) used to authenticate API requests. Include it in the Authorization header as `Bearer <token>`.
- **Refresh Token**: Longer-lived token (default: 4 minutes) used to obtain new access tokens when the current one expires.

### Authentication Flow

1. Login with credentials at `POST /v1/login` to receive both tokens
2. Use the access token for authenticated requests
3. When the access token expires, call `POST /v1/refresh` with the refresh token to get a new access token
4. Verify token validity with `POST /v1/verify`

### Token Configuration

Configure token expiration in the `.env` file (values are in **seconds**):
- `DATETIME_ACCESS_TOKEN_DELTA`: Access token lifetime in seconds (default: 120 = 2 minutes)
- `DATETIME_REFRESH_TOKEN_DELTA`: Refresh token lifetime in seconds (default: 240 = 4 minutes)

## v1 Endpoints

### Authentication Endpoints
- `POST /v1/login` - Authenticate user and receive access/refresh tokens
- `POST /v1/refresh` - Refresh expired access token using refresh token
- `POST /v1/verify` - Verify if access token is valid
- `POST /v1/logout` - Logout and clear session cookies

### Protected Endpoints
The following endpoints require authentication via Bearer token in the Authorization header:
- `POST /v1/category` - Create a new category
- `PUT /v1/category/<category_code>` - Update a category
- `DELETE /v1/category/<category_code>` - Delete a category
- `POST /v1/product` - Create a new product
- `PUT /v1/product/<product_id>` - Update a product
- `DELETE /v1/product/<product_id>` - Delete a product
- `POST /v1/collection` - Create a new collection
- `PUT /v1/collection/<collection_code>` - Update a collection
- `DELETE /v1/collection/<collection_code>` - Delete a collection
- `POST /v1/collection/<collection_code>/products` - Add product to collection
- `DELETE /v1/collection/<collection_code>/products/<product_sku>` - Remove product from collection

### Public Endpoints
- `GET /v1/product` - Get all products grouped by category
- `GET /v1/product/<category_code>` - Get products by category code
- `GET /v1/product/<sku>` - Get a specific product by SKU
- `GET /v1/category` - Get all categories
- `GET /v1/collection` - Get all collections
- `GET /v1/collection/<collection_code>/products` - Get products in a collection

## Project Structure

```
stylish-backend/
├── server.py              # Main Flask application
├── auth.py                # Authentication/Authorization module (JWT)
├── requirements.txt       # Python dependencies
├── config.env             # Environment variables (not in git)
├── sql/
│   ├── db.schema.sql      # Database schema
│   └── sample.shoes.data.sql # Sample data
├── app/                   # React Frontend application
│   ├── package.json       # Frontend dependencies
│   ├── src/               # Frontend source code
│   ├── public/            # Frontend public assets
│   └── dist/              # Built frontend (served by Flask)
└── entities/
    ├── product.py         # Product endpoints
    ├── category.py        # Category endpoints
    └── collection.py      # Collection endpoints
```

## Notes

- The application uses Flask-SQLAlchemy for ORM
- CORS is enabled for all routes
- Debug mode is enabled in development (disable for production)
- JWT authentication with access/refresh tokens for protected endpoints
- Access tokens expire in 2 minutes (configurable via `DATETIME_ACCESS_TOKEN_DELTA` in seconds)
- Refresh tokens expire in 4 minutes (configurable via `DATETIME_REFRESH_TOKEN_DELTA` in seconds)
- The React frontend is served from `app/dist/` and provides a dashboard UI for authenticated users

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or `brew services list` (macOS)
- Ensure the configuration file *.env is correctly "sourced", for a better startup of the server use a script like:
```bash
#!/bin/bash
echo "Starting server..."
set -a
source config.env
set +a
python3 server.py
```
- Verify the `.env` file contains the correct database URL
- Check that the database user has sufficient privileges

### Schema Migration
If you modify the schema, you'll need to:
1. Update `sql/db.schema.sql`
2. Apply changes: `psql -h localhost -U stylishuser -d stylishdb -f sql/db.schema.sql`