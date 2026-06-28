# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Initial project structure
- Flask REST API backend
- PostgreSQL database schema
- JWT authentication system
- Category CRUD endpoints
- Product CRUD endpoints
- Collection CRUD endpoints
- Collection-product association endpoints
- React dashboard frontend
- Startup script with optional clean build (`--force`)

---

## [1.0.0] - 2026-01-01

### Added
- Base Flask application with SQLAlchemy ORM
- Authentication module with JWT access/refresh tokens
- Product management with SKU, pricing, categories
- Category management for product organization
- Collection management for product grouping
- Many-to-many relationship between collections and products
- RESTful API endpoints under `/v1` prefix
- CORS support with credentials
- Environment-based configuration
- Sample data scripts for database initialization

---

## Version History

| Version | Description |
|---------|-------------|
| 1.0.0 | Initial release |