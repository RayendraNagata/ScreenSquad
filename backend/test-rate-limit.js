// Test script untuk rate limiting
// Jalankan dengan: node test-rate-limit.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser'
};

// Test rate limiting untuk different endpoints
async function testRateLimit() {
  console.log('🧪 Testing ScreenSquad Rate Limiting...\n');

  // Test 1: Auth Rate Limiting
  console.log('1️⃣ Testing Auth Rate Limiting (10 requests per 15 min)');
  await testAuthRateLimit();

  // Test 2: Squad Creation Rate Limiting  
  console.log('\n2️⃣ Testing Squad Creation Rate Limiting (5 requests per 15 min)');
  await testSquadCreationRateLimit();

  // Test 3: General POST Rate Limiting
  console.log('\n3️⃣ Testing General POST Rate Limiting (30 requests per min)');
  await testGeneralPostRateLimit();

  console.log('\n✅ Rate limiting tests completed!');
}

async function testAuthRateLimit() {
  console.log('Attempting 12 rapid login requests (should hit limit at 11th)...');
  
  for (let i = 1; i <= 12; i++) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });

      const data = await response.json();
      const remaining = response.headers.get('RateLimit-Remaining');
      const limit = response.headers.get('RateLimit-Limit');

      if (response.status === 429) {
        console.log(`   ❌ Request ${i}: Rate limited! ${data.message}`);
        console.log(`   📊 Headers: Limit=${limit}, Remaining=${remaining}`);
        break;
      } else {
        console.log(`   ✅ Request ${i}: Status=${response.status}, Remaining=${remaining}/${limit}`);
      }
    } catch (error) {
      console.log(`   🔥 Request ${i}: Error - ${error.message}`);
    }
    
    // Small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function testSquadCreationRateLimit() {
  console.log('Testing squad creation without authentication (should fail)...');
  
  // First register a user
  try {
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.status === 201) {
      console.log('   ✅ User registered successfully');
    }
  } catch (error) {
    console.log('   ⚠️ Registration failed (might already exist)');
  }

  // Login to get token
  let token = null;
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('   ✅ User logged in successfully');
    }
  } catch (error) {
    console.log('   ❌ Login failed');
    return;
  }

  if (!token) {
    console.log('   ❌ No token available, skipping squad creation test');
    return;
  }

  // Test squad creation rate limit
  console.log('Attempting 7 rapid squad creation requests (should hit limit at 6th)...');
  
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await fetch(`${BASE_URL}/squads/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Test Squad ${i}`,
          description: 'Rate limit test squad'
        })
      });

      const data = await response.json();
      const remaining = response.headers.get('RateLimit-Remaining');
      const limit = response.headers.get('RateLimit-Limit');

      if (response.status === 429) {
        console.log(`   ❌ Request ${i}: Rate limited! ${data.message}`);
        console.log(`   📊 Headers: Limit=${limit}, Remaining=${remaining}`);
        break;
      } else {
        console.log(`   ✅ Request ${i}: Status=${response.status}, Remaining=${remaining}/${limit}`);
      }
    } catch (error) {
      console.log(`   🔥 Request ${i}: Error - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function testGeneralPostRateLimit() {
  console.log('Testing general POST rate limiting...');
  console.log('Making multiple requests to different endpoints...');
  
  // Mix of different POST endpoints
  const endpoints = [
    { url: `${BASE_URL}/auth/login`, body: { email: 'test@test.com', password: 'test' } },
    { url: `${BASE_URL}/videos/add-url`, body: { url: 'http://example.com/video.mp4' }, needsAuth: true }
  ];

  for (let i = 1; i <= 35; i++) {
    const endpoint = endpoints[i % endpoints.length];
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(endpoint.body)
      });

      const remaining = response.headers.get('RateLimit-Remaining');
      const limit = response.headers.get('RateLimit-Limit');

      if (response.status === 429) {
        const data = await response.json();
        console.log(`   ❌ Request ${i}: Rate limited! ${data.message}`);
        console.log(`   📊 Headers: Limit=${limit}, Remaining=${remaining}`);
        break;
      } else {
        if (i % 5 === 0) { // Log every 5th request to avoid spam
          console.log(`   📈 Request ${i}: Status=${response.status}, Remaining=${remaining}/${limit}`);
        }
      }
    } catch (error) {
      console.log(`   🔥 Request ${i}: Error - ${error.message}`);
    }
    
    // Very small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// Helper function untuk delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
testRateLimit().catch(console.error);
