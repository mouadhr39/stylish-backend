DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Reset sequences for auto-increment
DROP SEQUENCE IF EXISTS product_id_seq;
DROP SEQUENCE IF EXISTS category_id_seq;
DROP SEQUENCE IF EXISTS users_id_seq;