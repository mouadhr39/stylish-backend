-- Cleanup (optional)
-- Drop in order of dependencies: product first (has foreign key), then category
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS category CASCADE;

-- Reset sequences for auto-increment
DROP SEQUENCE IF EXISTS product_id_seq;
DROP SEQUENCE IF EXISTS category_id_seq;

-- =====================================================
-- CATEGORY TABLE
-- =====================================================
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- =====================================================
-- PRODUCT TABLE
-- =====================================================
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',

    -- Relationship
    category_code VARCHAR(50) NOT NULL,

    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC(2,1) DEFAULT 0.0,
    reviews INT DEFAULT 0,
    image_path VARCHAR(255),

    CONSTRAINT fk_category
        FOREIGN KEY(category_code)
        REFERENCES category(code)
        ON DELETE CASCADE
);
