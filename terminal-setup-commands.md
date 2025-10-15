# Terminal Setup Commands

## Prerequisites
1. Make sure your server is running on `http://localhost:3000`
2. You need an admin user account and admin JWT token
3. You need at least one regular user to assign terminals to

## Step 1: Get Admin Token
First, login as admin to get your JWT token:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Save the `access_token` from the response for the next steps.**

## Step 2: Create Terminals
Create some terminals that can be assigned to users:

### Terminal 1 - Main Entrance
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Main Entrance Terminal",
    "description": "Primary terminal at main building entrance",
    "terminalId": "TERM-001",
    "status": "active",
    "location": "Building A - Main Entrance"
  }'
```

### Terminal 2 - Parking Area
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Parking Terminal",
    "description": "Terminal for parking area access",
    "terminalId": "TERM-002",
    "status": "active",
    "location": "Building A - Parking Level"
  }'
```

### Terminal 3 - Emergency Exit
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Emergency Exit Terminal",
    "description": "Terminal for emergency exit monitoring",
    "terminalId": "TERM-003",
    "status": "active",
    "location": "Building A - Emergency Exit"
  }'
```

## Step 3: Get All Users
Get the list of users to see who you can assign terminals to:

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Note the user IDs from the response for the next step.**

## Step 4: Assign Terminals to Users
Now assign terminals to specific users (replace USER_ID with actual user ID):

### Assign Terminal 1 to User
```bash
curl -X POST http://localhost:3000/terminals/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "userId": USER_ID,
    "terminalId": 1
  }'
```

### Assign Terminal 2 to Another User
```bash
curl -X POST http://localhost:3000/terminals/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "userId": ANOTHER_USER_ID,
    "terminalId": 2
  }'
```

## Step 5: Verify Assignments
Check that the assignments worked:

### Get All Assigned Users (PUP Admins)
```bash
curl -X GET http://localhost:3000/assigned-users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Get All Terminals
```bash
curl -X GET http://localhost:3000/terminals \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## Step 6: Test PUP Admin Access
Login as a user who was assigned a terminal to test PUP Admin access:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "user123"
  }'
```

Then use the PUP Admin token to access their assigned terminal:

```bash
curl -X GET http://localhost:3000/terminals \
  -H "Authorization: Bearer PUP_ADMIN_TOKEN_HERE"
```

## Additional Commands

### Unassign a Terminal
```bash
curl -X POST http://localhost:3000/terminals/unassign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalId": 1
  }'
```

### Update Terminal Status
```bash
curl -X PATCH http://localhost:3000/terminals/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "status": "maintenance"
  }'
```

### Delete a Terminal
```bash
curl -X DELETE http://localhost:3000/terminals/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## Notes
- Replace `YOUR_ADMIN_TOKEN_HERE` with the actual JWT token from Step 1
- Replace `USER_ID` with actual user IDs from Step 3
- Make sure your server is running before executing these commands
- The terminal assignment will automatically change the user's role to `PUP_ADMIN`
- When unassigned, the user's role will revert back to `USER`
