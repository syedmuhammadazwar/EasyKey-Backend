# Terminal Assignment Feature

This feature allows administrators to assign terminals to users, making them "PUP Admins" (Point of Use Admins) with specific terminal management capabilities.

## Overview

When an admin assigns a terminal to a user:
1. The user's role automatically changes from `USER` to `PUP_ADMIN`
2. The user gets access to their assigned terminal
3. The user can only view and manage their assigned terminal
4. When unassigned, the user's role reverts back to `USER`

## Database Schema

### User Entity Updates
- Added `PUP_ADMIN` role to `UserRole` enum
- Added `assignedTerminalId` field to track terminal assignment

### New Terminal Entity
```typescript
{
  id: number;
  name: string;
  description?: string;
  terminalId: string; // Unique identifier
  status: TerminalStatus; // ACTIVE, INACTIVE, MAINTENANCE
  location?: string;
  assignedUserId?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Admin Endpoints (Requires ADMIN role)

#### Create Terminal
```
POST /terminals
{
  "name": "Terminal-001",
  "description": "Main entrance terminal",
  "terminalId": "TERM-001",
  "status": "active",
  "location": "Building A - Main Entrance"
}
```

#### Get All Terminals
```
GET /terminals
```

#### Get Terminal by ID
```
GET /terminals/:id
```

#### Update Terminal
```
PATCH /terminals/:id
{
  "name": "Updated Terminal Name",
  "status": "maintenance"
}
```

#### Delete Terminal
```
DELETE /terminals/:id
```

#### Assign Terminal to User
```
POST /terminals/assign
{
  "userId": 1,
  "terminalId": 1
}
```

#### Unassign Terminal
```
POST /terminals/unassign
{
  "terminalId": 1
}
```

#### Get All Assigned Users
```
GET /terminals/assigned-users
```

### PUP Admin Endpoints (Requires PUP_ADMIN role)

#### Get My Assigned Terminals
```
GET /terminals
```

#### Get My Specific Terminal
```
GET /terminals/:id
```

## User Role Flow

### Assignment Process
1. Admin calls `POST /terminals/assign` with `userId` and `terminalId`
2. System validates:
   - User exists
   - Terminal exists
   - Terminal is not already assigned
   - User doesn't already have a terminal assigned
3. System updates:
   - Terminal's `assignedUserId` field
   - User's role to `PUP_ADMIN`
   - User's `assignedTerminalId` field

### Unassignment Process
1. Admin calls `POST /terminals/unassign` with `terminalId`
2. System updates:
   - Terminal's `assignedUserId` to null
   - User's role back to `USER`
   - User's `assignedTerminalId` to null

## Security Features

### Role-Based Access Control
- Only `ADMIN` users can create, update, delete terminals
- Only `ADMIN` users can assign/unassign terminals
- `PUP_ADMIN` users can only view their assigned terminal(s)
- `PUP_ADMIN` users cannot access other terminals

### Data Validation
- Terminal names and IDs must be unique
- Users cannot be assigned multiple terminals
- Terminals cannot be assigned to multiple users
- Proper error handling for all edge cases

## Testing

Use the provided `test-terminal-assignment.js` script to test the feature:

```bash
node test-terminal-assignment.js
```

Make sure your server is running on `http://localhost:3000` and you have:
1. An admin user created
2. At least one regular user created
3. Proper authentication tokens

## Example Usage

### 1. Create a Terminal (Admin)
```javascript
const terminal = await fetch('/terminals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <admin_token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Terminal-001',
    description: 'Main entrance terminal',
    terminalId: 'TERM-001',
    location: 'Building A - Main Entrance'
  })
});
```

### 2. Assign Terminal to User (Admin)
```javascript
const assignment = await fetch('/terminals/assign', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <admin_token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 1,
    terminalId: 1
  })
});
```

### 3. View Assigned Terminal (PUP Admin)
```javascript
const myTerminals = await fetch('/terminals', {
  headers: {
    'Authorization': 'Bearer <pup_admin_token>'
  }
});
```

## Error Handling

The system handles various error scenarios:
- Terminal not found
- User not found
- Terminal already assigned
- User already has terminal assigned
- Unauthorized access attempts
- Duplicate terminal names/IDs

All errors return appropriate HTTP status codes and descriptive error messages.
