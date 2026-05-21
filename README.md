# Stylish Backend

A Flask-based REST API for managing product categories and inventory.

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
```

### 4. Python Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 5. Database Initialization

Initialize the database schema and load sample data:

```bash
# Create tables
psql -h localhost -U stylishuser -d stylishdb -f sql/db.schema.sql

# Load sample data (optional)
psql -h localhost -U stylishuser -d stylishdb -f sql/sample.shoes.data.sql
```

## Running the Server

Start the Flask development server:

```bash
python server.py
```

The server will be available at `http://localhost:5000`.

## API Endpoints

- `GET /api/products` - Get all products grouped by category
- `GET /api/products/<category_code>` - Get products by category code
- `GET /api/product/<sku>` - Get a specific product by SKU
- `GET /api/categories` - Get all categories
- `POST /api/category` - Create a new category
- `PUT /api/category/<category_code>` - Update a category
- `DELETE /api/category/<category_code>` - Delete a category
- `POST /api/product` - Create a new product
- `PUT /api/product/<product_id>` - Update a product
- `DELETE /api/product/<product_id>` - Delete a product
- `GET /dashboard.html` - View the dashboard interface

## Project Structure

```
stylish-backend/
├── server.py              # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
├── sql/
│   ├── db.schema.sql      # Database schema
│   └── sample.shoes.data.sql # Sample data
├── templates/
│   └── dashboard.html     # Dashboard frontend
└── static/
    ├── dashboard.js       # Dashboard frontend logic
    └── dashboard.css      # Dashboard styling
```

## Notes

- The application uses Flask-SQLAlchemy for ORM
- CORS is enabled for all routes
- Debug mode is enabled in development (disable for production)
- The dashboard provides a simple UI for viewing products

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or `brew services list` (macOS)
- Verify the `.env` file contains the correct database URL
- Check that the database user has sufficient privileges

### Schema Migration
If you modify the schema, you'll need to:
1. Update `sql/db.schema.sql`
2. Apply changes: `psql -h localhost -U stylishuser -d stylishdb -f sql/db.schema.sql`