# EasyKey Backend API Documentation

## 📋 Overview

The EasyKey Backend API provides a comprehensive authentication system with user management capabilities. The API is built with NestJS and includes JWT-based authentication, Google OAuth integration, and role-based authorization.

**Base URL:** `http://localhost:3000`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Token Types
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for token renewal

---

## 📊 API Endpoints Summary

| Controller | Endpoints | Public | Protected |
|------------|-----------|--------|-----------|
| Auth | 11 | 7 | 4 |
| Users | 4 | 0 | 4 |
| **Total** | **15** | **7** | **8** |

---

## 🔑 Authentication Endpoints (`/auth`)

### 1. User Registration
**POST** `/auth/signup`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "Registration successful! Please check your email for verification code.",
  "email": "john@example.com"
}
```

**Error Responses:**
- `409 Conflict`: User with this email already exists
- `400 Bad Request`: Invalid request data

---

### 2. User Login
**POST** `/auth/signin`

Authenticate user and return access tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "provider": "local",
    "avatar": null,
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Invalid request data

---

### 3. Refresh Access Token
**POST** `/auth/refresh`

Get a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "provider": "local",
    "avatar": null,
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired refresh token

---

### 4. User Logout
**POST** `/auth/logout`

Logout from current device by invalidating the refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 5. Logout from All Devices
**POST** `/auth/logout-all`

Logout from all devices by invalidating all refresh tokens for the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out from all devices successfully"
}
```

---

### 6. Get User Profile
**GET** `/auth/profile`

Get the current authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "provider": "local",
  "avatar": null,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 7. Revoke All Tokens
**POST** `/auth/revoke-all-tokens`

Revoke all access and refresh tokens for the current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "All tokens revoked successfully"
}
```

---

### 8. Google OAuth Initiation
**GET** `/auth/google`

Initiate Google OAuth flow. This will redirect the user to Google's OAuth consent screen.

**Response:** Redirects to Google OAuth

---

### 9. Google OAuth Callback
**GET** `/auth/google/callback`

Google OAuth callback endpoint. This is called by Google after user authentication.

**Response:** Redirects to frontend with tokens in URL parameters

---

### 10. Email Verification
**POST** `/auth/verify-email`

Verify user's email with the 6-digit code received via email.

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "provider": "local",
    "avatar": null,
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid verification code, code expired, or email already verified
- `400 Bad Request`: User not found

---

### 11. Resend Verification Code
**POST** `/auth/resend-verification`

Resend verification code to user's email. If email is already verified, returns a friendly message.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK) - Unverified Email:**
```json
{
  "message": "Verification code sent to your email"
}
```

**Response (200 OK) - Already Verified Email:**
```json
{
  "message": "Your email is already verified. No verification code needed."
}
```

**Error Responses:**
- `400 Bad Request`: User not found

---

## 👥 User Management Endpoints (`/users`)

### 1. Create User
**POST** `/users`

Create a new user (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "provider": "local",
  "avatar": null,
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 2. Get All Users
**GET** `/users`

Retrieve a list of all users (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "provider": "local",
    "avatar": null,
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "provider": "local",
    "avatar": null,
    "isActive": true,
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 3. Get User by ID
**GET** `/users/:id`

Retrieve a specific user by their ID (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (number): User ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "provider": "local",
  "avatar": null,
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

### 4. Delete User
**DELETE** `/users/:id`

Delete a user account (requires authentication). Users can only delete their own account unless they are an admin.

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (number): User ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "provider": "local",
  "avatar": null,
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `403 Forbidden`: Unauthorized to delete this user
- `404 Not Found`: User not found

---

## 🚨 Error Responses

### Common Error Format
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required or invalid |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## 🔒 Security Features

### Authentication
- JWT-based authentication with access and refresh tokens
- Password hashing using bcryptjs (12 salt rounds)
- Token expiration and refresh mechanism
- Secure token storage in database

### Authorization
- Role-based access control (User, Admin)
- Resource-level permissions
- Global route protection with public route exceptions

### Rate Limiting
- Global rate limit: 100 requests per minute
- Authentication endpoints: 10 requests per minute

### Data Validation
- Input validation using class-validator
- Request body validation with DTOs
- SQL injection protection through TypeORM

---

## 🧪 Testing Examples

### Using cURL

#### Sign Up
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Sign In
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Verify Email
```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

#### Resend Verification Code
```bash
curl -X POST http://localhost:3000/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get All Users
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using JavaScript/Fetch

```javascript
// Sign up
const signUpResponse = await fetch('/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  })
});

const { message, email } = await signUpResponse.json();
console.log(message); // "Registration successful! Please check your email for verification code."

// Verify email with code received via email
const verifyResponse = await fetch('/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    code: '123456' // Replace with actual code from email
  })
});

const { accessToken, refreshToken, user } = await verifyResponse.json();

// Use token for protected routes
const usersResponse = await fetch('/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const users = await usersResponse.json();
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin123
DB_NAME=EasyKey

# Application Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [JWT.io](https://jwt.io/) - JWT token decoder
- [Postman Collection](./EasyKey_Auth_API.postman_collection.json) - Import this into Postman for easy testing
- [HTTP Test File](./test-auth.http) - Use with REST Client extension in VS Code

---

## 🆘 Support

For issues or questions:
1. Check the server logs for detailed error information
2. Verify your environment variables are correctly set
3. Ensure the database is running and accessible
4. Check that all required dependencies are installed

---

**Last Updated:** October 11, 2025  
**API Version:** 1.0.0  
**Server Status:** ✅ Running on http://localhost:3000

