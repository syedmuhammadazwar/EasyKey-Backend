# EasyKey Backend API Documentation for Flutter Developers

## 📋 Overview

The EasyKey Backend API provides a comprehensive authentication system with user management capabilities. This documentation is specifically designed for Flutter developers to integrate with the backend.

**Base URL:** `http://localhost:3000` (Development)  
**Production URL:** `https://your-production-domain.com`

## 🔐 Authentication Flow

The API uses JWT (JSON Web Tokens) with a dual-token system:
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal

### Flutter HTTP Client Setup

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://localhost:3000';
  static String? accessToken;
  static String? refreshToken;
  
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    if (accessToken != null) 'Authorization': 'Bearer $accessToken',
  };
}
```

---

## 📊 API Endpoints Summary

| Endpoint | Method | Public | Description |
|----------|--------|--------|-------------|
| `/auth/signup` | POST | ✅ | User registration with email verification |
| `/auth/verify-email` | POST | ✅ | Verify email with 6-digit code |
| `/auth/resend-verification` | POST | ✅ | Resend verification code |
| `/auth/signin` | POST | ✅ | User login |
| `/auth/refresh` | POST | ✅ | Refresh access token |
| `/auth/logout` | POST | ❌ | Logout from current device |
| `/auth/logout-all` | POST | ❌ | Logout from all devices |
| `/auth/profile` | GET | ❌ | Get user profile |
| `/auth/revoke-all-tokens` | POST | ❌ | Revoke all tokens |
| `/auth/google` | GET | ✅ | Google OAuth initiation |
| `/auth/google/callback` | GET | ✅ | Google OAuth callback |
| `/users` | GET | ❌ | Get all users |
| `/users` | POST | ❌ | Create user |
| `/users/:id` | GET | ❌ | Get user by ID |
| `/users/:id` | DELETE | ❌ | Delete user |

---

## 🔑 Authentication Endpoints

### 1. User Registration

**POST** `/auth/signup`

Register a new user account. User will receive a verification code via email.

**Request Body:**
```dart
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> signUp({
  required String name,
  required String email,
  required String password,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/signup'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'name': name,
      'email': email,
      'password': password,
    }),
  );

  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Registration failed: ${response.body}');
  }
}
```

**Response (201 Created):**
```dart
{
  "message": "Registration successful! Please check your email for verification code.",
  "email": "john@example.com"
}
```

**Error Responses:**
- `409 Conflict`: User with this email already exists
- `400 Bad Request`: Invalid request data

---

### 2. Email Verification

**POST** `/auth/verify-email`

Verify user's email with the 6-digit code received via email.

**Request Body:**
```dart
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> verifyEmail({
  required String email,
  required String code,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/verify-email'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'code': code,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    // Store tokens after successful verification
    accessToken = data['accessToken'];
    refreshToken = data['refreshToken'];
    return data;
  } else {
    throw Exception('Email verification failed: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
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
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Resend Verification Code

**POST** `/auth/resend-verification`

Resend verification code to user's email.

**Request Body:**
```dart
{
  "email": "john@example.com"
}
```

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> resendVerificationCode(String email) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/resend-verification'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email}),
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to resend verification code: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
{
  "message": "Verification code sent to your email"
}
```

---

### 4. User Login

**POST** `/auth/signin`

Authenticate user and return access tokens. Requires verified email.

**Request Body:**
```dart
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> signIn({
  required String email,
  required String password,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/signin'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    // Store tokens
    accessToken = data['accessToken'];
    refreshToken = data['refreshToken'];
    return data;
  } else {
    throw Exception('Login failed: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
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
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials or email not verified
- `400 Bad Request`: Invalid request data

---

### 5. Refresh Access Token

**POST** `/auth/refresh`

Get a new access token using a valid refresh token.

**Request Body:**
```dart
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> refreshTokens() async {
  if (refreshToken == null) {
    throw Exception('No refresh token available');
  }

  final response = await http.post(
    Uri.parse('$baseUrl/auth/refresh'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'refreshToken': refreshToken}),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    // Update stored tokens
    accessToken = data['accessToken'];
    refreshToken = data['refreshToken'];
    return data;
  } else {
    // Refresh token expired, redirect to login
    accessToken = null;
    refreshToken = null;
    throw Exception('Token refresh failed: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
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
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
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

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> getProfile() async {
  final response = await http.get(
    Uri.parse('$baseUrl/auth/profile'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 401) {
    // Token expired, try to refresh
    await refreshTokens();
    // Retry the request
    return getProfile();
  } else {
    throw Exception('Failed to get profile: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "provider": "local",
  "avatar": null,
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 7. User Logout

**POST** `/auth/logout`

Logout from current device by invalidating the refresh token.

**Request Body:**
```dart
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Flutter Implementation:**
```dart
Future<void> logout() async {
  if (refreshToken == null) return;

  final response = await http.post(
    Uri.parse('$baseUrl/auth/logout'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'refreshToken': refreshToken}),
  );

  // Clear tokens regardless of response
  accessToken = null;
  refreshToken = null;

  if (response.statusCode != 200) {
    throw Exception('Logout failed: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
{
  "message": "Logged out successfully"
}
```

---

### 8. Logout from All Devices

**POST** `/auth/logout-all`

Logout from all devices by invalidating all refresh tokens for the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Flutter Implementation:**
```dart
Future<void> logoutAll() async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/logout-all'),
    headers: headers,
  );

  // Clear tokens regardless of response
  accessToken = null;
  refreshToken = null;

  if (response.statusCode != 200) {
    throw Exception('Logout from all devices failed: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
{
  "message": "Logged out from all devices successfully"
}
```

---

## 👥 User Management Endpoints

### 1. Get All Users

**GET** `/users`

Retrieve a list of all users (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Flutter Implementation:**
```dart
Future<List<Map<String, dynamic>>> getAllUsers() async {
  final response = await http.get(
    Uri.parse('$baseUrl/users'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    final List<dynamic> users = jsonDecode(response.body);
    return users.cast<Map<String, dynamic>>();
  } else if (response.statusCode == 401) {
    await refreshTokens();
    return getAllUsers(); // Retry
  } else {
    throw Exception('Failed to get users: ${response.body}');
  }
}
```

**Response (200 OK):**
```dart
[
  {
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
  },
  {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "provider": "local",
    "avatar": null,
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Create User

**POST** `/users`

Create a new user (requires authentication).

**Request Body:**
```dart
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> createUser({
  required String name,
  required String email,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/users'),
    headers: headers,
    body: jsonEncode({
      'name': name,
      'email': email,
    }),
  );

  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 401) {
    await refreshTokens();
    return createUser(name: name, email: email); // Retry
  } else {
    throw Exception('Failed to create user: ${response.body}');
  }
}
```

---

### 3. Get User by ID

**GET** `/users/:id`

Retrieve a specific user by their ID (requires authentication).

**Flutter Implementation:**
```dart
Future<Map<String, dynamic>> getUserById(int id) async {
  final response = await http.get(
    Uri.parse('$baseUrl/users/$id'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 401) {
    await refreshTokens();
    return getUserById(id); // Retry
  } else if (response.statusCode == 404) {
    throw Exception('User not found');
  } else {
    throw Exception('Failed to get user: ${response.body}');
  }
}
```

---

### 4. Delete User

**DELETE** `/users/:id`

Delete a user account (requires authentication).

**Flutter Implementation:**
```dart
Future<void> deleteUser(int id) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/users/$id'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    return;
  } else if (response.statusCode == 401) {
    await refreshTokens();
    return deleteUser(id); // Retry
  } else if (response.statusCode == 403) {
    throw Exception('Unauthorized to delete this user');
  } else if (response.statusCode == 404) {
    throw Exception('User not found');
  } else {
    throw Exception('Failed to delete user: ${response.body}');
  }
}
```

---

## 🚨 Error Handling

### Common Error Format

```dart
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

### Flutter Error Handling Implementation

```dart
class ApiException implements Exception {
  final String message;
  final int statusCode;
  
  ApiException(this.message, this.statusCode);
  
  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

Future<T> handleApiResponse<T>(http.Response response, T Function(Map<String, dynamic>) fromJson) async {
  switch (response.statusCode) {
    case 200:
    case 201:
      return fromJson(jsonDecode(response.body));
    case 401:
      // Try to refresh token and retry
      await refreshTokens();
      throw RetryException('Token refreshed, retry request');
    case 400:
      throw ApiException('Bad Request', 400);
    case 403:
      throw ApiException('Forbidden', 403);
    case 404:
      throw ApiException('Not Found', 404);
    case 409:
      throw ApiException('Conflict', 409);
    case 429:
      throw ApiException('Too Many Requests', 429);
    case 500:
      throw ApiException('Internal Server Error', 500);
    default:
      throw ApiException('Unknown Error', response.statusCode);
  }
}
```

---

## 🔄 Complete Flutter Service Implementation

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:3000';
  static String? accessToken;
  static String? refreshToken;
  
  // Initialize tokens from storage
  static Future<void> initializeTokens() async {
    final prefs = await SharedPreferences.getInstance();
    accessToken = prefs.getString('access_token');
    refreshToken = prefs.getString('refresh_token');
  }
  
  // Save tokens to storage
  static Future<void> saveTokens(String access, String refresh) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', access);
    await prefs.setString('refresh_token', refresh);
    accessToken = access;
    refreshToken = refresh;
  }
  
  // Clear tokens from storage
  static Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    accessToken = null;
    refreshToken = null;
  }
  
  // Get headers with authorization
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    if (accessToken != null) 'Authorization': 'Bearer $accessToken',
  };
  
  // Sign up
  static Future<Map<String, dynamic>> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Registration failed: ${response.body}');
    }
  }
  
  // Verify email
  static Future<Map<String, dynamic>> verifyEmail({
    required String email,
    required String code,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/verify-email'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'code': code,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveTokens(data['accessToken'], data['refreshToken']);
      return data;
    } else {
      throw Exception('Email verification failed: ${response.body}');
    }
  }
  
  // Sign in
  static Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/signin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveTokens(data['accessToken'], data['refreshToken']);
      return data;
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }
  
  // Refresh tokens
  static Future<Map<String, dynamic>> refreshTokens() async {
    if (refreshToken == null) {
      throw Exception('No refresh token available');
    }
    
    final response = await http.post(
      Uri.parse('$baseUrl/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshToken}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveTokens(data['accessToken'], data['refreshToken']);
      return data;
    } else {
      await clearTokens();
      throw Exception('Token refresh failed: ${response.body}');
    }
  }
  
  // Get profile
  static Future<Map<String, dynamic>> getProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      await refreshTokens();
      return getProfile(); // Retry
    } else {
      throw Exception('Failed to get profile: ${response.body}');
    }
  }
  
  // Logout
  static Future<void> logout() async {
    if (refreshToken == null) return;
    
    final response = await http.post(
      Uri.parse('$baseUrl/auth/logout'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refreshToken}),
    );
    
    await clearTokens();
    
    if (response.statusCode != 200) {
      throw Exception('Logout failed: ${response.body}');
    }
  }
  
  // Check if user is logged in
  static bool get isLoggedIn => accessToken != null && refreshToken != null;
}
```

---

## 📱 Flutter Widget Example

```dart
import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    AuthService.initializeTokens();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    
    try {
      final result = await AuthService.signIn(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      
      // Navigate to home screen
      Navigator.pushReplacementNamed(context, '/home');
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: $e')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(labelText: 'Email'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your password';
                  }
                  return null;
                },
              ),
              SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _login,
                child: _isLoading 
                  ? CircularProgressIndicator() 
                  : Text('Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 🔧 Configuration

### Environment Variables

For production, update the base URL:

```dart
class ApiService {
  static const String baseUrl = kDebugMode 
    ? 'http://localhost:3000'  // Development
    : 'https://your-production-domain.com';  // Production
}
```

### Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.1.0
  shared_preferences: ^2.2.2
```

---

## 🆘 Support

For issues or questions:
1. Check the server logs for detailed error information
2. Verify your environment variables are correctly set
3. Ensure the database is running and accessible
4. Check that all required dependencies are installed

---

**Last Updated:** October 13, 2025  
**API Version:** 1.0.0  
**Server Status:** ✅ Running on http://localhost:3000
