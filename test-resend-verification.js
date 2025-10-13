// Test script to demonstrate the improved resend verification endpoint behavior
const http = require('http');

const baseUrl = 'http://localhost:3000';

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testResendVerification() {
  console.log('🧪 Testing Resend Verification Endpoint Behavior\n');

  // Test 1: Non-existent user
  console.log('1️⃣ Testing with non-existent user:');
  try {
    const result = await makeRequest('/auth/resend-verification', {
      email: 'nonexistent@example.com'
    });
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Response: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 2: Unverified user (this would work if user exists and is unverified)
  console.log('2️⃣ Testing with unverified user:');
  try {
    const result = await makeRequest('/auth/resend-verification', {
      email: 'unverified@example.com'
    });
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Response: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 3: Already verified user (this would work if user exists and is verified)
  console.log('3️⃣ Testing with already verified user:');
  try {
    const result = await makeRequest('/auth/resend-verification', {
      email: 'verified@example.com'
    });
    console.log(`   Status: ${result.statusCode}`);
    console.log(`   Response: ${JSON.stringify(result.body, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('✅ Test completed!');
  console.log('\n📝 Expected Behavior:');
  console.log('   • Non-existent user: 400 Bad Request with "User not found"');
  console.log('   • Unverified user: 200 OK with "Verification code sent to your email"');
  console.log('   • Already verified user: 200 OK with "Your email is already verified. No verification code needed."');
}

// Run the test
testResendVerification().catch(console.error);
