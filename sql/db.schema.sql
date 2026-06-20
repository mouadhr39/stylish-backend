-- =====================================================
-- db.schema.sql
-- Database schema definition for the Stylish Backend
-- =====================================================

-- Category table
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Product table
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    category_code VARCHAR(50) NOT NULL REFERENCES category(code),
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC(2, 1) DEFAULT 0.0,
    reviews INTEGER DEFAULT 0,
    image_path VARCHAR(255)
);

-- Collection table
CREATE TABLE collection (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Association table for many-to-many between Collection and Product
CREATE TABLE collection_product (
    collection_id INTEGER NOT NULL REFERENCES collection(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, product_id)
);

-- =====================================================
-- Indexes for performance (optional but recommended)
-- =====================================================

-- Index on product.category_code for faster lookups by category
CREATE INDEX idx_product_category_code ON product(category_code);

-- Index on collection_product for faster lookups (already covered by primary key, but explicit for clarity)
-- The primary key already creates an index on (collection_id, product_id)
-- Additional index for product_id lookups if needed
CREATE INDEX idx_collection_product_product_id ON collection_product(product_id);

-- =====================================================
-- USER TABLE
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    passwd_hash VARCHAR(255) NOT NULL, -- will store bcrypt hash
    name VARCHAR(255),
    surname VARCHAR(255)
);
