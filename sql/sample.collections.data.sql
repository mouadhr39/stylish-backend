-- =====================================================
-- collection_samples.sql
-- Sample data for collections and their product associations
-- =====================================================

-- Insert sample collections (using ON CONFLICT to avoid duplicates if code already exists)
INSERT INTO collection (code, name) VALUES
('COLL-001', 'Summer Collection'),
('COLL-002', 'Winter Collection'),
('COLL-003', 'Sports Collection')
ON CONFLICT (code) DO NOTHING;

-- Associate products with collections using SKU to find product IDs
WITH ins AS (
    INSERT INTO collection (code, name) VALUES
    ('COLL-001', 'Summer Collection'),
    ('COLL-002', 'Winter Collection'),
    ('COLL-003', 'Sports Collection')
    ON CONFLICT (code) DO NOTHING
    RETURNING id, code
)
INSERT INTO collection_product (collection_id, product_id)
SELECT i.id, p.id
FROM ins i
JOIN product p ON p.sku = ANY(
    CASE i.code
        WHEN 'COLL-001' THEN ARRAY['NK-PG40', 'AD-UBL1', 'NK-AF01', 'AD-SMB1']
        WHEN 'COLL-002' THEN ARRAY['NK-LB08', 'AD-HV08', 'PM-MB03', 'RB-FE05']
        WHEN 'COLL-003' THEN ARRAY['NK-MT09', 'AD-DST1', 'PM-DN02', 'RB-NX04']
    END
);

-- =====================================================
-- Example management queries (for reference)
-- =====================================================

-- Add a product to a collection (by collection code and product SKU)
-- INSERT INTO collection_product (collection_id, product_id)
-- SELECT c.id, p.id
-- FROM collection c
-- JOIN product p ON p.sku = 'NK-PG40'
-- WHERE c.code = 'COLL-001';

-- Remove a product from a collection (by collection code and product SKU)
-- DELETE FROM collection_product
-- USING collection c, product p
-- WHERE collection_product.collection_id = c.id
--   AND collection_product.product_id = p.id
--   AND c.code = 'COLL-001'
--   AND p.sku = 'NK-PG40';

-- Add multiple products to a collection at once (using a list of SKUs)
-- WITH target_collection AS (
--   SELECT id FROM collection WHERE code = 'COLL-001'
-- )
-- INSERT INTO collection_product (collection_id, product_id)
-- SELECT tc.id, p.id
-- FROM target_collection tc
-- JOIN product p ON p.sku IN ('SKU1', 'SKU2', 'SKU3');

-- Remove multiple products from a collection at once
-- WITH target_collection AS (
--   SELECT id FROM collection WHERE code = 'COLL-001'
-- )
-- DELETE FROM collection_product
-- USING target_collection tc, product p
-- WHERE collection_product.collection_id = tc.id
--   AND collection_product.product_id = p.id
--   AND p.sku IN ('SKU1', 'SKU2', 'SKU3');