import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middlewares/error.middleware';
import {
  loginSchema,
  registerSchema,
  type LoginRequest,
  type RegisterRequest,
} from '../validators/auth.validators';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body) as LoginRequest;
      
      // Perform login
      const result = await authService.login(validatedData);
      
      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800'), // 7 days in seconds
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body) as RegisterRequest;
      
      // Perform registration
      const result = await authService.register(validatedData);
      
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800'), // 7 days in seconds
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const user = await authService.getCurrentUser(req.user.userId, req.user.tenantId);
      
      if (!user) {
        throw new AppError(404, 'User not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Invalidate the refresh token in the database
      // 2. Add the access token to a blacklist (if using a blacklist strategy)
      // 3. Clear any session data
      
      // For now, we just return a success response
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // For now, return not implemented
      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Refresh token endpoint is under development',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Development/testing endpoint
  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new AppError(404, 'Endpoint not found', 'NOT_FOUND');
      }

      const users = authService.getAllUsers();
      
      res.status(200).json({
        success: true,
        data: {
          users,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}