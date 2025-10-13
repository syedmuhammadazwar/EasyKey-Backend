# EasyKey API Quick Reference

## 🚀 Quick Start

**Base URL:** `http://localhost:3000`

## 📋 All Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/signin` | ❌ | Login user |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout current device |
| POST | `/auth/logout-all` | ✅ | Logout all devices |
| GET | `/auth/profile` | ✅ | Get user profile |
| POST | `/auth/revoke-all-tokens` | ✅ | Revoke all tokens |
| GET | `/auth/google` | ❌ | Google OAuth |
| GET | `/auth/google/callback` | ❌ | Google OAuth callback |
| GET | `/users` | ✅ | Get all users |
| GET | `/users/:id` | ✅ | Get user by ID |
| POST | `/users` | ✅ | Create user |
| DELETE | `/users/:id` | ✅ | Delete user |

## 🔑 Authentication

### Get Token
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Use Token
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Common Request Bodies

### Sign Up/Sign In
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
```json
{
  "refreshToken": "your_refresh_token"
}
```

## 🚨 Common Responses

### Success (200/201)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Error (401)
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### Error (409)
```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

## 🧪 Testing Tools

1. **Postman**: Import `EasyKey_API_Collection.postman_collection.json`
2. **VS Code**: Use `API_Tests.http` with REST Client extension
3. **cURL**: Use examples from main documentation
4. **Node.js**: Use `quick-test.js` script

## 🔧 Environment Setup

```env
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin123
DB_NAME=EasyKey
```

## 📊 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests

## 🛡️ Security Notes

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- All routes are protected by default
- Use `@Public()` decorator for public routes
- Rate limiting: 100 req/min global, 10 req/min auth

