import type { Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service';
import { AppError } from '../middlewares/error.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
  type CreatePropertyRequest,
  type UpdatePropertyRequest,
  type GetPropertiesQueryParams,
} from '../validators/property.validators';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

const propertyService = new PropertyService();

export class PropertyController {
  async getProperties(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate query parameters
      const queryParams = getPropertiesQuerySchema.parse(req.query) as GetPropertiesQueryParams;
      
      // Get properties
      const result = await propertyService.getProperties(req.user.tenantId, queryParams);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'Property ID is required', 'VALIDATION_ERROR');
      }

      const property = await propertyService.getPropertyById(id, req.user.tenantId);
      
      if (!property) {
        throw new AppError(404, 'Property not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createProperty(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate request body
      const validatedData = createPropertySchema.parse(req.body) as CreatePropertyRequest;
      
      // Create property
      const property = await propertyService.createProperty(
        validatedData,
        req.user.tenantId,
        req.user.userId
      );
      
      res.status(201).json({
        success: true,
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProperty(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'Property ID is required', 'VALIDATION_ERROR');
      }

      // Validate request body
      const validatedData = updatePropertySchema.parse(req.body) as UpdatePropertyRequest;
      
      // Update property
      const property = await propertyService.updateProperty(
        id,
        validatedData,
        req.user.tenantId
      );
      
      res.status(200).json({
        success: true,
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProperty(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      
      if (!id) {
        throw new AppError(400, 'Property ID is required', 'VALIDATION_ERROR');
      }

      // Delete property
      await propertyService.deleteProperty(id, req.user.tenantId);
      
      res.status(200).json({
        success: true,
        message: 'Property deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addPropertyImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;
      const { url, thumbnailUrl, caption, isMain } = req.body;
      
      if (!id) {
        throw new AppError(400, 'Property ID is required', 'VALIDATION_ERROR');
      }

      if (!url) {
        throw new AppError(400, 'Image URL is required', 'VALIDATION_ERROR');
      }

      // Add image to property
      const property = await propertyService.addPropertyImage(
        id,
        { url, thumbnailUrl, caption, isMain },
        req.user.tenantId
      );
      
      res.status(200).json({
        success: true,
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async removePropertyImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id, imageId } = req.params;
      
      if (!id || !imageId) {
        throw new AppError(400, 'Property ID and Image ID are required', 'VALIDATION_ERROR');
      }

      // Remove image from property
      const property = await propertyService.removePropertyImage(
        id,
        imageId,
        req.user.tenantId
      );
      
      res.status(200).json({
        success: true,
        data: {
          property,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Get property statistics
      const stats = await propertyService.getPropertyStats(req.user.tenantId);
      
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
}