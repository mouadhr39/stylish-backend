-- =====================================================
-- INITIAL ADMIN USER (for development only)
-- =====================================================
INSERT INTO users (username, role, passwd_hash, name, surname)
VALUES ('admin', 'admin', crypt('admin', gen_salt('bf')), 'Admin', 'User');