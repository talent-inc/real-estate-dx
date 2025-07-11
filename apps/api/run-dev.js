// Simple development server runner
// This compiles TypeScript on-the-fly and runs the server

const fs = require('fs');
const path = require('path');

// Mock imports that aren't available
global.jwt = {
  sign: (payload, secret, options) => `mock-jwt-token-${Date.now()}`,
  verify: (token, secret) => ({
    userId: 'user_1',
    tenantId: 'tenant_001',
    email: 'test@example.com',
    role: 'USER'
  }),
  decode: (token) => null
};

global.bcrypt = {
  genSalt: async (rounds) => 'mock-salt',
  hash: async (password, salt) => `hashed-${password}`,
  compare: async (password, hash) => hash === `hashed-${password}`
};

// Simple Express server with mocked authentication
const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Backend API server is running with auth support',
    features: ['authentication', 'user-management']
  });
});

// In-memory user storage
const users = [];
let userCounter = 1;

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, tenantId, role = 'USER' } = req.body;
    
    // Validate required fields
    if (!email || !password || !name || !tenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: [
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' },
            { field: 'name', message: 'Name is required' },
            { field: 'tenantId', message: 'Tenant ID is required' }
          ].filter(detail => !req.body[detail.field])
        }
      });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email && u.tenantId === tenantId);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'User already exists'
        }
      });
    }

    // Create user
    const user = {
      id: `user_${userCounter++}`,
      email,
      password: `hashed-${password}`, // Mock hashing
      name,
      role,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(user);

    // Generate mock tokens
    const accessToken = `mock-access-token-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${Date.now()}`;

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 604800 // 7 days
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Registration failed'
      }
    });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, tenantId } = req.body;
    
    // Validate required fields
    if (!email || !password || !tenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields'
        }
      });
    }

    // Find user
    const user = users.find(u => u.email === email && u.tenantId === tenantId);
    if (!user || user.password !== `hashed-${password}`) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid credentials'
        }
      });
    }

    // Generate mock tokens
    const accessToken = `mock-access-token-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${Date.now()}`;

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: 604800 // 7 days
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed'
      }
    });
  }
});

app.get('/api/auth/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json({
    success: true,
    data: {
      users: usersWithoutPasswords
    }
  });
});

// Mock protected endpoints
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: {
      users: users.map(({ password, ...user }) => user)
    }
  });
});

app.get('/api/properties', (req, res) => {
  res.json({
    success: true,
    data: {
      properties: []
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Authentication endpoints available`);
  console.log(`👥 User management endpoints available`);
});