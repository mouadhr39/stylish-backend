# Contributing

## Development Setup

### Prerequisites
- Python 3.x
- PostgreSQL 12+
- Node.js 18+ (for frontend)

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd stylish-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Setup database
psql -h localhost -U postgres -f sql/db.schema.sql
psql -h localhost -U postgres -f sql/sample.user.data.sql
psql -h localhost -U postgres -f sql/sample.shoes.data.sql

# Configure environment
cp config.env.example .env
# Edit .env with your configuration
```

---

## Running the Application

### Development Mode
```bash
# Start with startup script (builds frontend if needed)
./startup.sh

# Or run backend only
python server.py
```

### Production Mode
- Disable debug mode in `server.py`
- Use production WSGI server (gunicorn, uWSGI)
- Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- Use HTTPS (required for secure cookies)

---

## Code Style

### Python
- Follow PEP 8 conventions
- Use SQLAlchemy ORM for database operations
- Keep route handlers thin - delegate to service functions
- Use `@EndpointProtectionVerifier` decorator for protected endpoints

### TypeScript/React
- Functional components only
- Use TypeScript interfaces for API types
- Context API for state management
- Keep API calls in `src/api/client.ts`

---

## Testing

Currently no test suite configured. Recommended approach:
```bash
# Python tests
pytest tests/

# Frontend tests
cd app && npm test
```

---

## Git Workflow

### Branch Naming
```
feature/<feature-name>  # New features
fix/<issue-name>        # Bug fixes
docs/<doc-topic>        # Documentation
```

### Commit Message Format
```
<type>(<scope>): <subject>

<body>
```

Types: feat, fix, docs, style, refactor, test, chore

---

## Entity Development Pattern

When adding new entities:

1. Create model in `entities/<entity>.py`
2. Define SQLAlchemy model class
3. Register blueprint in `server.py`
4. Add schema to `sql/db.schema.sql`
5. Create API routes following existing patterns

### Route Structure
```python
# Public endpoints
@entity_bp.route('/v1/entity', methods=['GET'])
def get_entities():
    ...

# Protected endpoints
@entity_bp.route('/v1/entity', methods=['POST'])
@EndpointProtectionVerifier
def create_entity():
    ...
```

---

## Database Migration

After schema changes:
```bash
# Update schema file
psql -h localhost -U postgres -f sql/db.schema.sql

# Or manually migrate existing database
psql -h localhost -U stylishuser -d stylishdb
```

---

## Deployment Checklist

- [ ] Set `SECRET_KEY` environment variable
- [ ] Set `JWT_SECRET_KEY` environment variable
- [ ] Disable Flask debug mode
- [ ] Configure HTTPS
- [ ] Run `npm run build` in `app/`
- [ ] Verify database connection