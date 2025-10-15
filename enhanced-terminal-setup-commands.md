# Enhanced Terminal Setup Commands

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

## Step 2: Create Enhanced Terminals
Create terminals with all the detailed information from the PUP & TERMINALS form:

### Terminal 1 - Main Shop
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalNumber": "TERM-001",
    "shopName": "Main Street Electronics",
    "streetAddress": "123 Main Street, Downtown",
    "postalCode": "12345",
    "stateRegion": "California",
    "email": "main@electronics.com",
    "phoneNumber": "+1-555-0123",
    "gpsCoordinates": "37.7749,-122.4194",
    "macAddress": "00:1B:44:11:3A:B7",
    "status": "active"
  }'
```

### Terminal 2 - Shopping Mall
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalNumber": "TERM-002",
    "shopName": "Mall Tech Store",
    "streetAddress": "456 Mall Drive, Shopping Center",
    "postalCode": "54321",
    "stateRegion": "New York",
    "email": "mall@techstore.com",
    "phoneNumber": "+1-555-0456",
    "gpsCoordinates": "40.7128,-74.0060",
    "macAddress": "00:1B:44:11:3A:C8",
    "status": "active"
  }'
```

### Terminal 3 - Airport Terminal
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalNumber": "TERM-003",
    "shopName": "Airport Convenience Store",
    "streetAddress": "789 Airport Boulevard, Terminal 2",
    "postalCode": "67890",
    "stateRegion": "Texas",
    "email": "airport@convenience.com",
    "phoneNumber": "+1-555-0789",
    "gpsCoordinates": "29.7604,-95.3698",
    "macAddress": "00:1B:44:11:3A:D9",
    "status": "active"
  }'
```

### Terminal 4 - University Campus
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalNumber": "TERM-004",
    "shopName": "Campus Bookstore",
    "streetAddress": "321 University Avenue, Student Center",
    "postalCode": "13579",
    "stateRegion": "Florida",
    "email": "campus@bookstore.edu",
    "phoneNumber": "+1-555-0321",
    "gpsCoordinates": "25.7617,-80.1918",
    "macAddress": "00:1B:44:11:3A:EA",
    "status": "active"
  }'
```

## Step 3: Get All Users
Get the list of users to see who you can assign terminals to:

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

**Note the user IDs from the response for the next step.**

## Step 4: Assign Terminals to Users (Making them PUP Admins)
Now assign terminals to specific users. When assigned, they automatically become PUP Admins:

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
Check that the assignments worked and users became PUP Admins:

### Get All Assigned Users (PUP Admins)
```bash
curl -X GET http://localhost:3000/terminals/assigned-users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Get All Terminals with Full Details
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

Then use the PUP Admin token to access their assigned terminal with all details:

```bash
curl -X GET http://localhost:3000/terminals \
  -H "Authorization: Bearer PUP_ADMIN_TOKEN_HERE"
```

## Step 7: Update Terminal Information
Update terminal details (Admin only):

```bash
curl -X PATCH http://localhost:3000/terminals/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "shopName": "Updated Shop Name",
    "phoneNumber": "+1-555-9999",
    "gpsCoordinates": "37.7849,-122.4094",
    "status": "maintenance"
  }'
```

## Additional Commands

### Unassign a Terminal (User becomes regular USER again)
```bash
curl -X POST http://localhost:3000/terminals/unassign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalId": 1
  }'
```

### Delete a Terminal
```bash
curl -X DELETE http://localhost:3000/terminals/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## What Happens When You Assign a Terminal

1. ✅ **User Role Changes**: User's role automatically changes from `USER` to `PUP_ADMIN`
2. ✅ **Terminal Assignment**: User gets assigned to the specific terminal
3. ✅ **Access Control**: PUP Admin can only see their assigned terminal with all details
4. ✅ **Full Terminal Info**: PUP Admin can see shop name, address, contact info, GPS coordinates, etc.

## What Happens When You Unassign a Terminal

1. ✅ **Role Reversion**: User's role automatically changes back from `PUP_ADMIN` to `USER`
2. ✅ **Terminal Unassignment**: User is removed from the terminal
3. ✅ **Access Removal**: User loses access to terminal management features

## Notes
- Replace `YOUR_ADMIN_TOKEN_HERE` with the actual JWT token from Step 1
- Replace `USER_ID` with actual user IDs from Step 3
- Make sure your server is running before executing these commands
- Each terminal now includes comprehensive business information
- GPS coordinates are stored as strings (format: "latitude,longitude")
- MAC addresses must be unique across all terminals
- Terminal numbers must be unique across all terminals
