// Simple test script for authentication endpoints
const http = require('http');

const API_BASE = 'http://localhost:4000/api';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Authentication API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing Health Check...');
    const health = await makeRequest('GET', '/health');
    console.log(`Status: ${health.status}`);
    console.log(`Response: ${JSON.stringify(health.data, null, 2)}\n`);

    // Test user registration
    console.log('2. Testing User Registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'Test123!@#',
      name: 'Test User',
      tenantId: 'tenant_001',
      role: 'USER'
    };
    
    const register = await makeRequest('POST', '/auth/register', registerData);
    console.log(`Status: ${register.status}`);
    console.log(`Response: ${JSON.stringify(register.data, null, 2)}\n`);

    // Test user login
    console.log('3. Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'Test123!@#',
      tenantId: 'tenant_001'
    };
    
    const login = await makeRequest('POST', '/auth/login', loginData);
    console.log(`Status: ${login.status}`);
    console.log(`Response: ${JSON.stringify(login.data, null, 2)}\n`);

    // Test get all users (development endpoint)
    console.log('4. Testing Get All Users (dev endpoint)...');
    const users = await makeRequest('GET', '/auth/users');
    console.log(`Status: ${users.status}`);
    console.log(`Response: ${JSON.stringify(users.data, null, 2)}\n`);

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testAPI();