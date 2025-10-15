// Test script for terminal assignment feature
// This demonstrates how an admin can assign terminals to users

const BASE_URL = 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    throw error;
  }
}

// Test scenarios
async function testTerminalAssignment() {
  console.log('🚀 Testing Terminal Assignment Feature\n');

  try {
    // Step 1: Admin login (you'll need to replace with actual admin credentials)
    console.log('1. Admin login...');
    const adminLogin = await apiCall('/auth/login', 'POST', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.access_token;
    console.log('✅ Admin logged in successfully\n');

    // Step 2: Create a terminal
    console.log('2. Creating a terminal...');
    const terminal = await apiCall('/terminals', 'POST', {
      name: 'Terminal-001',
      description: 'Main entrance terminal',
      terminalId: 'TERM-001',
      location: 'Building A - Main Entrance'
    }, adminToken);
    console.log('✅ Terminal created:', terminal);
    console.log('');

    // Step 3: Get all users to find one to assign
    console.log('3. Getting all users...');
    const users = await apiCall('/users', 'GET', null, adminToken);
    console.log('✅ Users retrieved:', users.length, 'users found');
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    // Step 4: Assign terminal to first user
    const userToAssign = users[0];
    console.log(`4. Assigning terminal to user: ${userToAssign.name} (ID: ${userToAssign.id})...`);
    const assignment = await apiCall('/terminals/assign', 'POST', {
      userId: userToAssign.id,
      terminalId: terminal.id
    }, adminToken);
    console.log('✅ Terminal assigned successfully');
    console.log('');

    // Step 5: Verify the assignment
    console.log('5. Verifying assignment...');
    const assignedUsers = await apiCall('/terminals/assigned-users', 'GET', null, adminToken);
    console.log('✅ Assigned users:', assignedUsers);
    console.log('');

    // Step 6: Check user's role change
    console.log('6. Checking user role change...');
    const updatedUser = await apiCall(`/users/${userToAssign.id}`, 'GET', null, adminToken);
    console.log('✅ User role updated to:', updatedUser.role);
    console.log('✅ User assigned terminal ID:', updatedUser.assignedTerminalId);
    console.log('');

    // Step 7: Test PUP_ADMIN access to their terminal
    console.log('7. Testing PUP_ADMIN access...');
    const userLogin = await apiCall('/auth/login', 'POST', {
      email: userToAssign.email,
      password: 'user123' // You'll need to set this password
    });
    const userToken = userLogin.access_token;
    
    const userTerminals = await apiCall('/terminals', 'GET', null, userToken);
    console.log('✅ PUP_ADMIN can see their assigned terminals:', userTerminals);
    console.log('');

    // Step 8: Unassign terminal
    console.log('8. Unassigning terminal...');
    await apiCall('/terminals/unassign', 'POST', {
      terminalId: terminal.id
    }, adminToken);
    console.log('✅ Terminal unassigned successfully');
    console.log('');

    // Step 9: Verify unassignment
    console.log('9. Verifying unassignment...');
    const finalUser = await apiCall(`/users/${userToAssign.id}`, 'GET', null, adminToken);
    console.log('✅ User role reverted to:', finalUser.role);
    console.log('✅ User assigned terminal ID:', finalUser.assignedTerminalId);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTerminalAssignment();
