# Terminal & Assignment API Documentation

## Overview
This document describes the API endpoints for managing terminals and terminal assignments. The system allows administrators to create terminals and assign them to users with detailed business information, making users PUP Admins.

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
http://13.60.27.4:3000
```

---

## Terminal Management Endpoints

### 1. Create Terminal
Creates a new terminal with basic information.

**Endpoint:** `POST /terminals`

**Access:** Admin only

**Request Body:**
```json
{
  "terminalNumber": "TERM-001",
  "status": "active"
}
```

**Response:**
```json
{
  "id": 1,
  "terminalNumber": "TERM-001",
  "status": "active",
  "assignedUserId": null,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "updatedAt": "2025-01-15T14:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://13.60.27.4:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "terminalNumber": "TERM-001",
    "status": "active"
  }'
```

---

### 2. Get All Terminals
Retrieves all terminals (Admin) or assigned terminals (PUP Admin).

**Endpoint:** `GET /terminals`

**Access:** Admin, PUP Admin

**Response (Admin):**
```json
[
  {
    "id": 1,
    "terminalNumber": "TERM-001",
    "status": "active",
    "assignedUserId": 2,
    "createdAt": "2025-01-15T14:30:00.000Z",
    "updatedAt": "2025-01-15T14:30:00.000Z"
  }
]
```

**Response (PUP Admin):**
```json
[
  {
    "id": 1,
    "terminalNumber": "TERM-001",
    "status": "active",
    "assignedUserId": 2,
    "createdAt": "2025-01-15T14:30:00.000Z",
    "updatedAt": "2025-01-15T14:30:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://13.60.27.4:3000/terminals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get Terminal by ID
Retrieves a specific terminal by ID.

**Endpoint:** `GET /terminals/:id`

**Access:** Admin, PUP Admin (can only access their assigned terminal)

**Response:**
```json
{
  "id": 1,
  "terminalNumber": "TERM-001",
  "status": "active",
  "assignedUserId": 2,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "updatedAt": "2025-01-15T14:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X GET http://13.60.27.4:3000/terminals/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Update Terminal
Updates terminal information.

**Endpoint:** `PATCH /terminals/:id`

**Access:** Admin only

**Request Body:**
```json
{
  "terminalNumber": "TERM-001-UPDATED",
  "status": "maintenance"
}
```

**Response:**
```json
{
  "id": 1,
  "terminalNumber": "TERM-001-UPDATED",
  "status": "maintenance",
  "assignedUserId": 2,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "updatedAt": "2025-01-15T14:35:00.000Z"
}
```

**cURL Example:**
```bash
curl -X PATCH http://13.60.27.4:3000/terminals/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "terminalNumber": "TERM-001-UPDATED",
    "status": "maintenance"
  }'
```

---

### 5. Delete Terminal
Deletes a terminal (will unassign if currently assigned).

**Endpoint:** `DELETE /terminals/:id`

**Access:** Admin only

**Response:**
```json
{
  "message": "Terminal deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://13.60.27.4:3000/terminals/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Terminal Assignment Endpoints

### 6. Assign Terminal to User
Assigns a terminal to a user with detailed business information. User becomes PUP Admin.

**Endpoint:** `POST /terminals/assign`

**Access:** Admin only

**Request Body:**
```json
{
  "userId": 2,
  "terminalId": 1,
  "shopName": "Main Street Electronics",
  "streetAddress": "123 Main Street, Downtown",
  "postalCode": "12345",
  "stateRegion": "California",
  "email": "main@electronics.com",
  "phoneNumber": "+1-555-0123",
  "gpsCoordinates": "37.7749,-122.4194",
  "macAddress": "00:1B:44:11:3A:B7"
}
```

**Response:**
```json
{
  "id": 1,
  "terminalId": 1,
  "userId": 2,
  "shopName": "Main Street Electronics",
  "streetAddress": "123 Main Street, Downtown",
  "postalCode": "12345",
  "stateRegion": "California",
  "email": "main@electronics.com",
  "phoneNumber": "+1-555-0123",
  "gpsCoordinates": "37.7749,-122.4194",
  "macAddress": "00:1B:44:11:3A:B7",
  "isActive": true,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "updatedAt": "2025-01-15T14:30:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://13.60.27.4:3000/terminals/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": 2,
    "terminalId": 1,
    "shopName": "Main Street Electronics",
    "streetAddress": "123 Main Street, Downtown",
    "postalCode": "12345",
    "stateRegion": "California",
    "email": "main@electronics.com",
    "phoneNumber": "+1-555-0123",
    "gpsCoordinates": "37.7749,-122.4194",
    "macAddress": "00:1B:44:11:3A:B7"
  }'
```

---

### 7. Unassign Terminal
Unassigns a terminal from a user. User role reverts to USER.

**Endpoint:** `POST /terminals/unassign`

**Access:** Admin only

**Request Body:**
```json
{
  "terminalId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "terminalNumber": "TERM-001",
  "status": "active",
  "assignedUserId": null,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "updatedAt": "2025-01-15T14:40:00.000Z"
}
```

**cURL Example:**
```bash
curl -X POST http://13.60.27.4:3000/terminals/unassign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "terminalId": 1
  }'
```

---

## Assignment Information Endpoints

### 8. Get All Assignments
Retrieves all active terminal assignments with business details.

**Endpoint:** `GET /terminals/assignments`

**Access:** Admin only

**Response:**
```json
[
  {
    "id": 1,
    "terminalId": 1,
    "userId": 2,
    "shopName": "Main Street Electronics",
    "streetAddress": "123 Main Street, Downtown",
    "postalCode": "12345",
    "stateRegion": "California",
    "email": "main@electronics.com",
    "phoneNumber": "+1-555-0123",
    "gpsCoordinates": "37.7749,-122.4194",
    "macAddress": "00:1B:44:11:3A:B7",
    "isActive": true,
    "createdAt": "2025-01-15T14:30:00.000Z",
    "updatedAt": "2025-01-15T14:30:00.000Z",
    "terminal": {
      "id": 1,
      "terminalNumber": "TERM-001",
      "status": "active"
    },
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "pup_admin"
    }
  }
]
```

**cURL Example:**
```bash
curl -X GET http://13.60.27.4:3000/terminals/assignments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 9. Get Assignment Details by Terminal ID
Retrieves assignment details for a specific terminal.

**Endpoint:** `GET /terminals/assignments/:terminalId`

**Access:** Admin, PUP Admin (can only access their own assignment)

**Response:**
```json
{
  "id": 1,
  "terminalId": 1,
  "userId": 2,
  "shopName": "Main Street Electronics",
  "streetAddress": "123 Main Street, Downtown",
  "postalCode": "12345",
  "stateRegion": "California",
  "email": "main@electronics.com",
  "phoneNumber": "+1-555-0123",
  "gpsCoordinates": "37.7749,-122.4194",
  "macAddress": "00:1B:44:11:3A:B7",
  "isActive": true,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "updatedAt": "2025-01-15T14:30:00.000Z",
  "terminal": {
    "id": 1,
    "terminalNumber": "TERM-001",
    "status": "active"
  },
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "pup_admin"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://13.60.27.4:3000/terminals/assignments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 10. Get My Assignment (PUP Admin)
Retrieves the current user's assignment details.

**Endpoint:** `GET /terminals/my-assignment`

**Access:** PUP Admin only

**Response:**
```json
{
  "id": 1,
  "terminalId": 1,
  "userId": 2,
  "shopName": "Main Street Electronics",
  "streetAddress": "123 Main Street, Downtown",
  "postalCode": "12345",
  "stateRegion": "California",
  "email": "main@electronics.com",
  "phoneNumber": "+1-555-0123",
  "gpsCoordinates": "37.7749,-122.4194",
  "macAddress": "00:1B:44:11:3A:B7",
  "isActive": true,
  "createdAt": "2025-01-15T14:30:00.000Z",
  "updatedAt": "2025-01-15T14:30:00.000Z",
  "terminal": {
    "id": 1,
    "terminalNumber": "TERM-001",
    "status": "active"
  },
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "pup_admin"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://13.60.27.4:3000/terminals/my-assignment \
  -H "Authorization: Bearer YOUR_PUP_ADMIN_TOKEN"
```

---

### 11. Get Assigned Users
Retrieves all users who are currently PUP Admins.

**Endpoint:** `GET /terminals/assigned-users`

**Access:** Admin only

**Response:**
```json
[
  {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "pup_admin",
    "assignedTerminalId": 1,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T14:30:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://13.60.27.4:3000/terminals/assigned-users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Data Models

### Terminal
```typescript
{
  id: number;
  terminalNumber: string; // Unique identifier
  status: 'active' | 'inactive' | 'maintenance';
  assignedUserId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### TerminalAssignment
```typescript
{
  id: number;
  terminalId: number;
  userId: number;
  shopName: string;
  streetAddress: string;
  postalCode: string;
  stateRegion: string;
  email: string;
  phoneNumber: string;
  gpsCoordinates?: string; // Optional GPS coordinates
  macAddress: string; // Unique MAC address
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  terminal?: Terminal; // Populated in responses
  user?: User; // Populated in responses
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Terminal with this number already exists",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Terminal with ID 1 not found",
  "error": "Not Found"
}
```

---

## Business Logic

### Assignment Process
1. Admin creates a terminal with basic information
2. Admin assigns terminal to user with detailed business information
3. User's role automatically changes to `PUP_ADMIN`
4. User can access their assigned terminal and business details
5. When unassigned, user's role reverts to `USER`

### Access Control
- **Admin**: Full access to all terminals and assignments
- **PUP Admin**: Can only access their assigned terminal and assignment details
- **User**: No access to terminal endpoints

### Validation Rules
- Terminal numbers must be unique
- MAC addresses must be unique across active assignments
- Users cannot be assigned multiple terminals
- Terminals cannot be assigned to multiple users
- GPS coordinates are optional and stored as strings

---

## Complete Workflow Example

### 1. Create Terminal
```bash
curl -X POST http://13.60.27.4:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"terminalNumber": "TERM-001", "status": "active"}'
```

### 2. Assign Terminal to User
```bash
curl -X POST http://13.60.27.4:3000/terminals/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "userId": 2,
    "terminalId": 1,
    "shopName": "Main Street Electronics",
    "streetAddress": "123 Main Street, Downtown",
    "postalCode": "12345",
    "stateRegion": "California",
    "email": "main@electronics.com",
    "phoneNumber": "+1-555-0123",
    "gpsCoordinates": "37.7749,-122.4194",
    "macAddress": "00:1B:44:11:3A:B7"
  }'
```

### 3. PUP Admin Views Their Assignment
```bash
curl -X GET http://13.60.27.4:3000/terminals/my-assignment \
  -H "Authorization: Bearer PUP_ADMIN_TOKEN"
```

### 4. Admin Views All Assignments
```bash
curl -X GET http://13.60.27.4:3000/terminals/assignments \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 5. Unassign Terminal
```bash
curl -X POST http://13.60.27.4:3000/terminals/unassign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"terminalId": 1}'
```

---

## Notes
- All timestamps are in ISO 8601 format
- GPS coordinates are stored as strings in "latitude,longitude" format
- MAC addresses should follow standard MAC address format
- Assignment records are preserved when unassigned (marked as inactive)
- The system automatically manages user roles during assignment/unassignment
