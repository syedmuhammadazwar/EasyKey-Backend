const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function testAllEndpoints() {
  log('🧪 Testing All API Endpoints...', 'blue');
  log('================================', 'blue');

  let accessToken = '';
  let refreshToken = '';

  try {
    // Test 1: Sign Up (Public)
    log('\n1. POST /auth/signup (Public)', 'yellow');
    try {
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Endpoint Test User',
        email: 'endpointtest@example.com',
        password: 'password123'
      });
      log('✅ Success - User created', 'green');
      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
    } catch (error) {
      if (error.response?.status === 409) {
        log('⚠️  User already exists (expected)', 'yellow');
      } else {
        log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // Test 2: Sign In (Public)
    log('\n2. POST /auth/signin (Public)', 'yellow');
    try {
      const response = await axios.post(`${BASE_URL}/auth/signin`, {
        email: 'endpointtest@example.com',
        password: 'password123'
      });
      log('✅ Success - User signed in', 'green');
      accessToken = response.data.accessToken;
      refreshToken = response.data.refreshToken;
    } catch (error) {
      log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
    }

    // Test 3: Get Profile (Protected)
    log('\n3. GET /auth/profile (Protected)', 'yellow');
    try {
      const response = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      log('✅ Success - Profile retrieved', 'green');
    } catch (error) {
      log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
    }

    // Test 4: Get All Users (Protected)
    log('\n4. GET /users (Protected)', 'yellow');
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      log(`✅ Success - Found ${response.data.length} users`, 'green');
    } catch (error) {
      log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
    }

    // Test 5: Get User by ID (Protected)
    log('\n5. GET /users/1 (Protected)', 'yellow');
    try {
      const response = await axios.get(`${BASE_URL}/users/1`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      log('✅ Success - User retrieved', 'green');
    } catch (error) {
      log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
    }

    // Test 6: Refresh Token (Public)
    log('\n6. POST /auth/refresh (Public)', 'yellow');
    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken
      });
      log('✅ Success - Token refreshed', 'green');
      accessToken = response.data.accessToken;
    } catch (error) {
      log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
    }

    // Test 7: Logout (Protected)
    log('\n7. POST /auth/logout (Protected)', 'yellow');
    try {
      const response = await axios.post(`${BASE_URL}/auth/logout`, {
        refreshToken: refreshToken
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      log('✅ Success - User logged out', 'green');
    } catch (error) {
      log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
    }

    // Test 8: Test Protected Route Without Token
    log('\n8. GET /users (Without Token)', 'yellow');
    try {
      await axios.get(`${BASE_URL}/users`);
      log('❌ Failed - Should have been rejected', 'red');
    } catch (error) {
      if (error.response?.status === 401) {
        log('✅ Success - Correctly rejected (401 Unauthorized)', 'green');
      } else {
        log(`❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
      }
    }

    // Test 9: Google OAuth (Public)
    log('\n9. GET /auth/google (Public)', 'yellow');
    try {
      const response = await axios.get(`${BASE_URL}/auth/google`);
      log('✅ Success - Google OAuth initiated', 'green');
    } catch (error) {
      if (error.response?.status === 302) {
        log('✅ Success - Redirect to Google (302)', 'green');
      } else {
        log(`⚠️  Google OAuth not configured: ${error.response?.data?.message || error.message}`, 'yellow');
      }
    }

    log('\n🎉 All endpoint tests completed!', 'green');
    log('================================', 'blue');

  } catch (error) {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
  }
}

testAllEndpoints();

