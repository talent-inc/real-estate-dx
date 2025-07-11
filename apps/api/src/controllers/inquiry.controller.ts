import type { Response, NextFunction } from 'express';
import { InquiryService } from '../services/inquiry.service';
import { AppError } from '../middlewares/error.middleware';
import {
  createInquirySchema,
  updateInquirySchema,
  getInquiriesQuerySchema,
  respondToInquirySchema,
  type CreateInquiryRequest,
  type UpdateInquiryRequest,
  type GetInquiriesQueryParams,
  type RespondToInquiryRequest,
} from '../validators/inquiry.validators';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

const inquiryService = new InquiryService();

export class InquiryController {
  async getInquiries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate query parameters
      const queryParams = getInquiriesQuerySchema.parse(req.query) as GetInquiriesQueryParams;
      
      // Get inquiries
      const result = await inquiryService.getInquiries(req.user.tenantId, queryParams);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInquiryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'Inquiry ID is required', 'VALIDATION_ERROR');
      }

      const inquiry = await inquiryService.getInquiryById(id, req.user.tenantId);
      
      if (!inquiry) {
        throw new AppError(404, 'Inquiry not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          inquiry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate request body
      const validatedData = createInquirySchema.parse(req.body) as CreateInquiryRequest;
      
      // Create inquiry
      const inquiry = await inquiryService.createInquiry(validatedData, req.user.tenantId);
      
      res.status(201).json({
        success: true,
        data: {
          inquiry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'Inquiry ID is required', 'VALIDATION_ERROR');
      }

      // Validate request body
      const validatedData = updateInquirySchema.parse(req.body) as UpdateInquiryRequest;
      
      // Update inquiry
      const inquiry = await inquiryService.updateInquiry(id, validatedData, req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: {
          inquiry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async respondToInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'Inquiry ID is required', 'VALIDATION_ERROR');
      }

      // Validate request body
      const validatedData = respondToInquirySchema.parse(req.body) as RespondToInquiryRequest;
      
      // Respond to inquiry
      const inquiry = await inquiryService.respondToInquiry(
        id,
        validatedData,
        req.user.tenantId,
        req.user.userId
      );
      
      res.status(200).json({
        success: true,
        data: {
          inquiry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async assignInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      const { assignedToId } = req.body;
      
      if (!id) {
        throw new AppError(400, 'Inquiry ID is required', 'VALIDATION_ERROR');
      }

      if (!assignedToId) {
        throw new AppError(400, 'Assigned user ID is required', 'VALIDATION_ERROR');
      }

      // Assign inquiry
      const inquiry = await inquiryService.assignInquiry(id, assignedToId, req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: {
          inquiry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'Inquiry ID is required', 'VALIDATION_ERROR');
      }

      // Delete inquiry
      await inquiryService.deleteInquiry(id, req.user.tenantId);
      
      res.status(200).json({
        success: true,
        message: 'Inquiry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getInquiryStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Get inquiry statistics
      const stats = await inquiryService.getInquiryStats(req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Public endpoint for creating inquiries (no authentication required)
  async createPublicInquiry(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.headers;
      
      if (!tenantId) {
        throw new AppError(400, 'Tenant ID is required', 'VALIDATION_ERROR');
      }

      // Validate request body
      const validatedData = createInquirySchema.parse(req.body) as CreateInquiryRequest;
      
      // Create inquiry
      const inquiry = await inquiryService.createInquiry(validatedData, tenantId as string);
      
      res.status(201).json({
        success: true,
        data: {
          inquiry: {
            id: inquiry.id,
            message: 'Your inquiry has been submitted successfully. We will respond to you shortly.',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}