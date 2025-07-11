import { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { generateTestJWT, generateTestUser, generateTestAdmin } from '../helpers/auth.helper';
import { AppError } from '../../middlewares/error.middleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    
    // Setup test user in global storage
    global.users = [];
    global.userIdCounter = 1;
  });

  describe('authenticate middleware', () => {
    it('should authenticate user with valid token', async () => {
      const testUser = generateTestUser();
      global.users.push(testUser);

      const token = generateTestJWT(testUser);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe(testUser.id);
      expect(mockRequest.user?.email).toBe(testUser.email);
    });

    it('should reject request without authorization header', async () => {
      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('No token provided');
    });

    it('should reject request with invalid token format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidTokenFormat',
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token format');
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject request when user not found', async () => {
      const testUser = generateTestUser();
      const token = generateTestJWT(testUser);
      
      // Don't add user to global storage
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject request when user is inactive', async () => {
      const testUser = generateTestUser({ isActive: false });
      global.users.push(testUser);

      const token = generateTestJWT(testUser);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await authenticate(mockRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('requireRole middleware', () => {
    let authenticatedRequest: any;

    beforeEach(() => {
      authenticatedRequest = {
        ...mockRequest,
        user: generateTestUser(),
      };
    });

    it('should allow access for user with required role', () => {
      authenticatedRequest.user.role = 'TENANT_ADMIN';
      const middleware = requireRole(['TENANT_ADMIN', 'MANAGER']);

      middleware(authenticatedRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should allow access for user with one of multiple required roles', () => {
      authenticatedRequest.user.role = 'MANAGER';
      const middleware = requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']);

      middleware(authenticatedRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should deny access for user without required role', () => {
      authenticatedRequest.user.role = 'USER';
      const middleware = requireRole(['TENANT_ADMIN', 'MANAGER']);

      middleware(authenticatedRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient permissions');
    });

    it('should deny access when user is not defined', () => {
      const unauthenticatedRequest = { ...mockRequest };
      const middleware = requireRole(['USER']);

      middleware(unauthenticatedRequest as any, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should work with single role string', () => {
      authenticatedRequest.user.role = 'AGENT';
      const middleware = requireRole(['AGENT']);

      middleware(authenticatedRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should work with role hierarchy', () => {
      authenticatedRequest.user.role = 'TENANT_ADMIN';
      const middleware = requireRole(['USER']); // TENANT_ADMIN should have USER permissions

      middleware(authenticatedRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
});