import jwt from 'jsonwebtoken';
import type { User } from '../../services/user.service';

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
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    isActive: true,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    profileImage: null,
    phone: null,
    settings: {},
    ...overrides,
  };
};

export const generateTestAdmin = (overrides: Partial<User> = {}): User => {
  return generateTestUser({
    role: 'TENANT_ADMIN',
    email: 'admin@example.com',
    ...overrides,
  });
};

export const generateTestManager = (overrides: Partial<User> = {}): User => {
  return generateTestUser({
    role: 'MANAGER',
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