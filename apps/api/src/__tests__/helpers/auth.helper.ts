import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

export const generateTestJWT = (user: Partial<User>): string => {
  const payload = {
    id: user.id || 'test_user_id',
    email: user.email || 'test@example.com',
    role: user.role || 'USER',
    tenantId: user.tenantId || 'tenant_test',
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
};

export const generateTestUser = (overrides: Partial<User> = {}): User => {
  return {
    id: 'test_user_id',
    tenantId: 'tenant_test',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    department: null,
    phone: null,
    avatar: null,
    password: 'hashed_password',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

export const generateTestAdmin = (overrides: Partial<User> = {}): User => {
  return generateTestUser({
    role: 'ADMIN',
    email: 'admin@example.com',
    ...overrides,
  });
};

export const generateTestManager = (overrides: Partial<User> = {}): User => {
  return generateTestUser({
    role: 'AGENT',
    email: 'manager@example.com',
    ...overrides,
  });
};

export const generateTestAgent = (overrides: Partial<User> = {}): User => {
  return generateTestUser({
    role: 'AGENT',
    email: 'agent@example.com',
    ...overrides,
  });
};