# Authentication System Documentation

This document describes the comprehensive authentication system implemented in the EasyKey Backend API.

## Features

- **JWT-based Authentication** with access and refresh tokens
- **Google OAuth 2.0** integration
- **Role-based Authorization** (User, Admin)
- **Password Hashing** using bcryptjs
- **Rate Limiting** with Throttler
- **Token Management** (refresh, revoke, logout all devices)
- **Email Verification** support (ready for implementation)
- **Password Reset** functionality (ready for implementation)

## API Endpoints

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
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
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/auth/signin`
Sign in with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as signup response.

#### POST `/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** Same as signup response with new tokens.

#### POST `/auth/logout`
Logout from current device.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/logout-all`
Logout from all devices.

**Headers:** `Authorization: Bearer <access_token>`

#### GET `/auth/google`
Initiate Google OAuth flow.

#### GET `/auth/google/callback`
Google OAuth callback (handled automatically).

#### GET `/auth/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

#### POST `/auth/revoke-all-tokens`
Revoke all tokens for current user.

**Headers:** `Authorization: Bearer <access_token>`

### Protected User Endpoints

All user endpoints now require authentication:

#### GET `/users`
Get all users (requires authentication).

#### GET `/users/:id`
Get user by ID (requires authentication).

#### DELETE `/users/:id`
Delete user (requires authentication, can only delete own account or admin can delete any).

## Environment Configuration

Create a `.env` file based on `env.template`:

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
JWT_ACCESS_SECRET=your-super-secret-access-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Security Features

### JWT Tokens
- **Access Token**: Short-lived (15 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Separate Secrets**: Different secrets for access and refresh tokens
- **Token Type Validation**: Tokens include type field to prevent misuse

### Password Security
- **bcryptjs Hashing**: Passwords hashed with salt rounds of 12
- **No Password Storage**: Passwords never returned in API responses

### Rate Limiting
- **Global Rate Limit**: 100 requests per minute
- **Auth Endpoints**: 10 requests per minute for auth endpoints

### Authorization
- **Role-based Access**: User and Admin roles
- **Resource Protection**: Users can only access/modify their own resources
- **Admin Override**: Admins can access all resources

## Database Schema

### User Entity
```typescript
{
  id: number (Primary Key)
  name: string
  email: string (Unique)
  password: string (Nullable, hashed)
  role: UserRole (user | admin)
  provider: AuthProvider (local | google)
  googleId: string (Nullable)
  avatar: string (Nullable)
  isActive: boolean
  isEmailVerified: boolean
  emailVerificationToken: string (Nullable)
  passwordResetToken: string (Nullable)
  passwordResetExpires: Date (Nullable)
  createdAt: Date
  updatedAt: Date
}
```

### RefreshToken Entity
```typescript
{
  id: string (UUID, Primary Key)
  token: string
  userId: number (Foreign Key)
  expiresAt: Date
  isRevoked: boolean
  createdAt: Date
}
```

## Usage Examples

### Frontend Integration

#### Sign Up
```javascript
const response = await fetch('/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const { accessToken, refreshToken, user } = await response.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

#### Making Authenticated Requests
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

#### Token Refresh
```javascript
const refreshToken = localStorage.getItem('refreshToken');

const response = await fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { accessToken, refreshToken: newRefreshToken } = await response.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', newRefreshToken);
```

### Google OAuth Flow

1. Redirect user to `/auth/google`
2. User completes Google OAuth
3. User is redirected to frontend with tokens in URL parameters
4. Frontend extracts tokens and stores them

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: User created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Invalid credentials or expired token
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: User already exists
- `429 Too Many Requests`: Rate limit exceeded

## Installation and Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment template:
```bash
cp env.template .env
```

3. Update `.env` with your configuration

4. Run database migrations (handled automatically in development):
```bash
npm run start:dev
```

5. The API will be available at `http://localhost:3000`

## Production Considerations

1. **Change JWT Secrets**: Use strong, unique secrets in production
2. **Database Security**: Use connection pooling and SSL
3. **Rate Limiting**: Adjust limits based on your needs
4. **CORS**: Configure CORS for your frontend domain
5. **HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Never commit `.env` files
7. **Database Migrations**: Use proper migrations in production
8. **Monitoring**: Implement logging and monitoring
9. **Backup**: Regular database backups
10. **Security Headers**: Add security headers middleware

## Future Enhancements

- Email verification system
- Password reset functionality
- Two-factor authentication (2FA)
- Social login providers (Facebook, Twitter, etc.)
- Account lockout after failed attempts
- Session management
- Audit logging
- API key authentication for service-to-service communication
