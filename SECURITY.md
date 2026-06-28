# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

---

## Reporting a Vulnerability

Please report security vulnerabilities by creating an issue in the repository with the `security` label, or contact the maintainers directly.

Do not report vulnerabilities through public issues if they could be exploited before a fix is available.

---

## Security Measures

### Authentication & Authorization
- JWT tokens with short expiration times
- HttpOnly, Secure, SameSite cookies
- Token type validation on protected endpoints

### Data Protection
- Password hashing via PostgreSQL `crypt()` (bcrypt)
- SQL injection prevention via SQLAlchemy ORM
- Environment variables for secrets

### Headers & CORS
- CORS enabled with `supports_credentials=True`
- Session cookies configured securely
- Static file serving from built frontend

---

## Security Configuration

### Required in Production
1. Set strong `SECRET_KEY` environment variable
2. Set strong `JWT_SECRET_KEY` environment variable
3. Use HTTPS (required for secure cookies)
4. Disable Flask debug mode

### Environment Variables
```bash
# Use strong, randomly generated secrets
SECRET_KEY=<strong-random-string>
JWT_SECRET_KEY=<strong-random-string>

# Reduce token lifetime in production if needed
DATETIME_ACCESS_TOKEN_DELTA=120
DATETIME_REFRESH_TOKEN_DELTA=240
```

---

## Known Issues

- Debug mode enabled by default in `server.py` - disable in production
- Secure cookies may cause issues in local HTTP development

---

## Security Best Practices

- Rotate JWT secrets periodically
- Use HTTPS in production
- Keep dependencies updated
- Monitor authentication logs
- Validate all user input on server side