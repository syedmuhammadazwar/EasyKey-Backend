const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Helper function to log with colors
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Helper function to make API requests
const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testSignUp = async () => {
  log('\n🧪 Testing Sign Up...', 'yellow');
  const result = await makeRequest('POST', '/auth/signup', TEST_USER);
  
  if (result.success) {
    log('✅ Sign Up successful!', 'green');
    log(`Status: ${result.status}`, 'blue');
    log(`User ID: ${result.data.user.id}`, 'blue');
    return result.data;
  } else {
    log('❌ Sign Up failed!', 'red');
    log(`Status: ${result.status}`, 'red');
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

const testSignIn = async () => {
  log('\n🧪 Testing Sign In...', 'yellow');
  const result = await makeRequest('POST', '/auth/signin', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (result.success) {
    log('✅ Sign In successful!', 'green');
    log(`Status: ${result.status}`, 'blue');
    return result.data;
  } else {
    log('❌ Sign In failed!', 'red');
    log(`Status: ${result.status}`, 'red');
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

const testGetProfile = async (accessToken) => {
  log('\n🧪 Testing Get Profile...', 'yellow');
  const result = await makeRequest('GET', '/auth/profile', null, {
    'Authorization': `Bearer ${accessToken}`
  });
  
  if (result.success) {
    log('✅ Get Profile successful!', 'green');
    log(`Status: ${result.status}`, 'blue');
    log(`User: ${result.data.name} (${result.data.email})`, 'blue');
    return result.data;
  } else {
    log('❌ Get Profile failed!', 'red');
    log(`Status: ${result.status}`, 'red');
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

const testGetUsers = async (accessToken) => {
  log('\n🧪 Testing Get All Users...', 'yellow');
  const result = await makeRequest('GET', '/users', null, {
    'Authorization': `Bearer ${accessToken}`
  });
  
  if (result.success) {
    log('✅ Get All Users successful!', 'green');
    log(`Status: ${result.status}`, 'blue');
    log(`Users count: ${result.data.length}`, 'blue');
    return result.data;
  } else {
    log('❌ Get All Users failed!', 'red');
    log(`Status: ${result.status}`, 'red');
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

const testRefreshToken = async (refreshToken) => {
  log('\n🧪 Testing Token Refresh...', 'yellow');
  const result = await makeRequest('POST', '/auth/refresh', {
    refreshToken
  });
  
  if (result.success) {
    log('✅ Token Refresh successful!', 'green');
    log(`Status: ${result.status}`, 'blue');
    return result.data;
  } else {
    log('❌ Token Refresh failed!', 'red');
    log(`Status: ${result.status}`, 'red');
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

const testLogout = async (refreshToken) => {
  log('\n🧪 Testing Logout...', 'yellow');
  const result = await makeRequest('POST', '/auth/logout', {
    refreshToken
  });
  
  if (result.success) {
    log('✅ Logout successful!', 'green');
    log(`Status: ${result.status}`, 'blue');
    log(`Message: ${result.data.message}`, 'blue');
    return result.data;
  } else {
    log('❌ Logout failed!', 'red');
    log(`Status: ${result.status}`, 'red');
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
    return null;
  }
};

const testProtectedRouteWithoutToken = async () => {
  log('\n🧪 Testing Protected Route Without Token...', 'yellow');
  const result = await makeRequest('GET', '/users');
  
  if (!result.success && result.status === 401) {
    log('✅ Protection working correctly!', 'green');
    log(`Status: ${result.status}`, 'blue');
    return true;
  } else {
    log('❌ Protection not working!', 'red');
    log(`Status: ${result.status}`, 'red');
    log(`Error: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
};

// Main test runner
const runTests = async () => {
  log('🚀 Starting Authentication API Tests...', 'blue');
  log('=====================================', 'blue');
  
  try {
    // Test 1: Sign Up
    const signUpData = await testSignUp();
    if (!signUpData) {
      log('\n❌ Sign Up failed, stopping tests', 'red');
      return;
    }
    
    // Test 2: Sign In
    const signInData = await testSignIn();
    if (!signInData) {
      log('\n❌ Sign In failed, stopping tests', 'red');
      return;
    }
    
    const { accessToken, refreshToken } = signInData;
    
    // Test 3: Get Profile
    await testGetProfile(accessToken);
    
    // Test 4: Get All Users
    await testGetUsers(accessToken);
    
    // Test 5: Refresh Token
    const refreshData = await testRefreshToken(refreshToken);
    if (refreshData) {
      // Update tokens
      const newAccessToken = refreshData.accessToken;
      const newRefreshToken = refreshData.refreshToken;
      
      // Test with new tokens
      await testGetProfile(newAccessToken);
    }
    
    // Test 6: Logout
    await testLogout(refreshToken);
    
    // Test 7: Protected route without token
    await testProtectedRouteWithoutToken();
    
    log('\n🎉 All tests completed!', 'green');
    log('=====================================', 'blue');
    
  } catch (error) {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
  }
};

// Check if axios is available
try {
  require('axios');
  runTests();
} catch (error) {
  log('❌ axios is not installed. Please run: npm install axios', 'red');
  log('Or use one of the other testing methods provided.', 'yellow');
}
