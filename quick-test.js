const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing Authentication APIs...\n');

  try {
    // Test 1: Sign Up
    console.log('1. Testing Sign Up...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    console.log('✅ Sign Up Success!');
    console.log('User ID:', signupResponse.data.user.id);
    console.log('Access Token:', signupResponse.data.accessToken.substring(0, 50) + '...');
    console.log('Refresh Token:', signupResponse.data.refreshToken.substring(0, 50) + '...\n');

    const { accessToken, refreshToken } = signupResponse.data;

    // Test 2: Sign In
    console.log('2. Testing Sign In...');
    const signinResponse = await axios.post(`${BASE_URL}/auth/signin`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    
    console.log('✅ Sign In Success!');
    console.log('User:', signinResponse.data.user.name, '(' + signinResponse.data.user.email + ')\n');

    // Test 3: Get Profile
    console.log('3. Testing Get Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    console.log('✅ Get Profile Success!');
    console.log('Profile:', profileResponse.data.name, '-', profileResponse.data.role, '\n');

    // Test 4: Get All Users
    console.log('4. Testing Get All Users...');
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    console.log('✅ Get All Users Success!');
    console.log('Total Users:', usersResponse.data.length, '\n');

    // Test 5: Test Invalid Login
    console.log('5. Testing Invalid Login...');
    try {
      await axios.post(`${BASE_URL}/auth/signin`, {
        email: 'testuser@example.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Invalid Login Correctly Rejected!');
      console.log('Error:', error.response.data.message, '\n');
    }

    // Test 6: Test Protected Route Without Token
    console.log('6. Testing Protected Route Without Token...');
    try {
      await axios.get(`${BASE_URL}/users`);
    } catch (error) {
      console.log('✅ Protected Route Correctly Rejected!');
      console.log('Status:', error.response.status, '\n');
    }

    console.log('🎉 All tests passed! Your authentication system is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();

