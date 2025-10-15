# Corrected Terminal Setup Commands

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

## Step 2: Create Basic Terminals
Create terminals with just basic information (terminal number and status):

### Terminal 1
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalNumber": "TERM-001",
    "status": "active"
  }'
```

### Terminal 2
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalNumber": "TERM-002",
    "status": "active"
  }'
```

### Terminal 3
```bash
curl -X POST http://localhost:3000/terminals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "terminalNumber": "TERM-003",
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

## Step 4: Assign Terminals to Users with Business Details
Now assign terminals to specific users with all the detailed business information. This is when you collect all the form data:

### Assign Terminal 1 to User with Business Details
```bash
curl -X POST http://localhost:3000/terminals/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "userId": USER_ID,
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

### Assign Terminal 2 to Another User with Business Details
```bash
curl -X POST http://localhost:3000/terminals/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "userId": ANOTHER_USER_ID,
    "terminalId": 2,
    "shopName": "Mall Tech Store",
    "streetAddress": "456 Mall Drive, Shopping Center",
    "postalCode": "54321",
    "stateRegion": "New York",
    "email": "mall@techstore.com",
    "phoneNumber": "+1-555-0456",
    "gpsCoordinates": "40.7128,-74.0060",
    "macAddress": "00:1B:44:11:3A:C8"
  }'
```

### Assign Terminal 3 to Another User with Business Details
```bash
curl -X POST http://localhost:3000/terminals/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "userId": THIRD_USER_ID,
    "terminalId": 3,
    "shopName": "Airport Convenience Store",
    "streetAddress": "789 Airport Boulevard, Terminal 2",
    "postalCode": "67890",
    "stateRegion": "Texas",
    "email": "airport@convenience.com",
    "phoneNumber": "+1-555-0789",
    "gpsCoordinates": "29.7604,-95.3698",
    "macAddress": "00:1B:44:11:3A:D9"
  }'
```

## Step 5: Verify Assignments
Check that the assignments worked and users became PUP Admins:

### Get All Assignments with Business Details
```bash
curl -X GET http://localhost:3000/terminals/assignments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Get All Assigned Users (PUP Admins)
```bash
curl -X GET http://localhost:3000/terminals/assigned-users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### Get Assignment Details for Specific Terminal
```bash
curl -X GET http://localhost:3000/terminals/assignments/1 \
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

Then use the PUP Admin token to access their assignment details:

### Get My Assignment Details (PUP Admin)
```bash
curl -X GET http://localhost:3000/terminals/my-assignment \
  -H "Authorization: Bearer PUP_ADMIN_TOKEN_HERE"
```

### Get My Terminal
```bash
curl -X GET http://localhost:3000/terminals \
  -H "Authorization: Bearer PUP_ADMIN_TOKEN_HERE"
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

## What Happens When You Assign a Terminal

1. ✅ **User Role Changes**: User's role automatically changes from `USER` to `PUP_ADMIN`
2. ✅ **Terminal Assignment**: User gets assigned to the specific terminal
3. ✅ **Business Details Stored**: All shop information, address, contact details, GPS coordinates, and MAC address are stored in the assignment
4. ✅ **Access Control**: PUP Admin can only see their assigned terminal and assignment details
5. ✅ **Full Business Info**: PUP Admin can see all business details including shop name, address, contact info, GPS coordinates, etc.

## What Happens When You Unassign a Terminal

1. ✅ **Role Reversion**: User's role automatically changes back from `PUP_ADMIN` to `USER`
2. ✅ **Terminal Unassignment**: User is removed from the terminal
3. ✅ **Assignment Deactivation**: The assignment record is marked as inactive (preserved for history)
4. ✅ **Access Removal**: User loses access to terminal management features

## New API Endpoints

- `GET /terminals/assignments` - Get all active assignments (Admin only)
- `GET /terminals/assignments/:terminalId` - Get assignment details for specific terminal
- `GET /terminals/my-assignment` - Get my assignment details (PUP Admin only)

## Notes
- Replace `YOUR_ADMIN_TOKEN_HERE` with the actual JWT token from Step 1
- Replace `USER_ID` with actual user IDs from Step 3
- Make sure your server is running before executing these commands
- Each assignment now includes comprehensive business information
- GPS coordinates are stored as strings (format: "latitude,longitude")
- MAC addresses must be unique across all active assignments
- Terminal numbers must be unique across all terminals
- Assignment records are preserved when unassigned (marked as inactive)
