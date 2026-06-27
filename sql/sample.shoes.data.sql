-- =====================================================
-- schema_and_sample_data.sql
-- PostgreSQL sample data with relationships
-- =====================================================


-- =====================================================
-- INSERT CATEGORIES
-- =====================================================
INSERT INTO category (id, code, name)
VALUES
(1, 'CAT-001', 'Running Shoes'),
(2, 'CAT-002', 'Basketball Shoes'),
(3, 'CAT-003', 'Lifestyle Sneakers'),
(4, 'CAT-004', 'Training Shoes');

-- =====================================================
-- INSERT PRODUCTS
-- category_code references category(code)
-- =====================================================

INSERT INTO product
(
    name,
    sku,
    price,
    currency,
    category_code,
    in_stock,
    rating,
    reviews,
    image_path
)
VALUES

-- =========================================
-- NIKE
-- =========================================
(
    'Nike Air Zoom Pegasus 40',
    'NK-PG40',
    139.99,
    'USD',
    'CAT-001',
    true,
    4.7,
    842,
    'card-item1.jpg'
),
(
    'Nike Metcon 9',
    'NK-MT09',
    129.99,
    'USD',
    'CAT-004',
    true,
    4.6,
    421,
    'card-item2.jpg'
),
(
    'Nike Air Force 1',
    'NK-AF01',
    119.99,
    'USD',
    'CAT-003',
    true,
    4.8,
    1540,
    'card-item3.jpg'
),
(
    'Nike LeBron Witness 8',
    'NK-LB08',
    149.99,
    'USD',
    'CAT-002',
    true,
    4.5,
    367,
    'card-item4.jpg'
),

-- =========================================
-- ADIDAS
-- =========================================
(
    'Adidas Ultraboost Light',
    'AD-UBL1',
    189.99,
    'USD',
    'CAT-001',
    true,
    4.8,
    978,
    'card-item5.jpg'
),
(
    'Adidas Harden Vol. 8',
    'AD-HV08',
    159.99,
    'USD',
    'CAT-002',
    true,
    4.6,
    285,
    'card-item6.jpg'
),
(
    'Adidas Samba OG',
    'AD-SMB1',
    109.99,
    'USD',
    'CAT-003',
    true,
    4.9,
    1882,
    'card-item7.jpg'
),
(
    'Adidas Dropset Trainer',
    'AD-DST1',
    119.99,
    'USD',
    'CAT-004',
    true,
    4.4,
    204,
    'card-item8.jpg'
),

-- =========================================
-- PUMA
-- =========================================
(
    'Puma Deviate Nitro 2',
    'PM-DN02',
    159.99,
    'USD',
    'CAT-001',
    true,
    4.5,
    311,
    'card-item8.jpg'
),
(
    'Puma MB.03 Basketball',
    'PM-MB03',
    139.99,
    'USD',
    'CAT-002',
    true,
    4.7,
    455,
    'card-item8.jpg'
),
(
    'Puma Suede Classic XXI',
    'PM-SC21',
    89.99,
    'USD',
    'CAT-003',
    true,
    4.6,
    732,
    'card-item8.jpg'
),

-- =========================================
-- REEBOK
-- =========================================
(
    'Reebok Nano X4',
    'RB-NX04',
    139.99,
    'USD',
    'CAT-004',
    true,
    4.5,
    268,
    'card-item8.jpg'
),
(
    'Reebok Floatride Energy 5',
    'RB-FE05',
    129.99,
    'USD',
    'CAT-001',
    true,
    4.4,
    194,
    'card-item8.jpg'
),
(
    'Reebok Club C 85',
    'RB-CC85',
    79.99,
    'USD',
    'CAT-003',
    true,
    4.7,
    1403,
    'card-item8.jpg'
),

-- =========================================
-- DIADORA
-- =========================================
(
    'Diadora Mythos Blushield 8',
    'DD-MB08',
    149.99,
    'USD',
    'CAT-001',
    true,
    4.3,
    88,
    'card-item8.jpg'
),
(
    'Diadora Mi Basket Used',
    'DD-MBKU',
    179.99,
    'USD',
    'CAT-003',
    true,
    4.5,
    134,
    'card-item8.jpg'
),

-- =========================================
-- NEW BALANCE
-- =========================================
(
    'New Balance Fresh Foam X 1080v13',
    'NB-1080',
    164.99,
    'USD',
    'CAT-001',
    true,
    4.8,
    643,
    'card-item8.jpg'
),
(
    'New Balance 550',
    'NB-0550',
    119.99,
    'USD',
    'CAT-003',
    true,
    4.7,
    1294,
    'card-item8.jpg'
),

-- =========================================
-- ASICS
-- =========================================
(
    'ASICS Gel-Kayano 31',
    'AS-GK31',
    179.99,
    'USD',
    'CAT-001',
    true,
    4.9,
    512,
    'card-item8.jpg'
),
(
    'ASICS Gel-Quantum 360',
    'AS-GQ36',
    169.99,
    'USD',
    'CAT-003',
    true,
    4.6,
    341,
    'card-item8.jpg'
);

-- =====================================================
-- EXAMPLE QUERY WITH RELATIONSHIP
-- =====================================================

-- Retrieve products with category names
--SELECT
--    p.id,
--    p.name,
--    p.sku,
--    p.price,
--    p.currency,
--    c.name AS category,
--    p.in_stock,
--    p.rating,
--    p.reviews
--FROM product p
--JOIN category c
--    ON p.category_code = c.code;