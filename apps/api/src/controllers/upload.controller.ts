import type { Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { AppError } from '../middlewares/error.middleware';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

const uploadService = new UploadService();

export class UploadController {
  async uploadImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Mock file object (in real implementation, this would come from multer)
      const mockFile = {
        filename: `${Date.now()}_image.jpg`,
        originalname: req.body.filename || 'uploaded_image.jpg',
        mimetype: req.body.mimetype || 'image/jpeg',
        size: req.body.size || 1024000, // 1MB default
      };

      // Validate file
      const validation = uploadService.validateFile(mockFile, 'image');
      if (!validation.isValid) {
        throw new AppError(400, validation.error!, 'VALIDATION_ERROR');
      }

      // Upload file
      const uploadedFile = await uploadService.uploadFile(
        mockFile,
        req.user.tenantId,
        req.user.userId,
        'image'
      );

      res.status(201).json({
        success: true,
        data: {
          file: uploadedFile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Mock file object (in real implementation, this would come from multer)
      const mockFile = {
        filename: `${Date.now()}_document.pdf`,
        originalname: req.body.filename || 'uploaded_document.pdf',
        mimetype: req.body.mimetype || 'application/pdf',
        size: req.body.size || 2048000, // 2MB default
      };

      // Validate file
      const validation = uploadService.validateFile(mockFile, 'document');
      if (!validation.isValid) {
        throw new AppError(400, validation.error!, 'VALIDATION_ERROR');
      }

      // Upload file
      const uploadedFile = await uploadService.uploadFile(
        mockFile,
        req.user.tenantId,
        req.user.userId,
        'document'
      );

      res.status(201).json({
        success: true,
        data: {
          file: uploadedFile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFiles(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { userId } = req.query;

      // Get files
      const files = await uploadService.getUserFiles(
        req.user.tenantId,
        userId as string
      );

      res.status(200).json({
        success: true,
        data: {
          files,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;

      if (!id) {
        throw new AppError(400, 'File ID is required', 'VALIDATION_ERROR');
      }

      // Get file
      const file = await uploadService.getFile(id, req.user.tenantId);

      if (!file) {
        throw new AppError(404, 'File not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          file,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { id } = req.params;

      if (!id) {
        throw new AppError(400, 'File ID is required', 'VALIDATION_ERROR');
      }

      // Delete file
      await uploadService.deleteFile(id, req.user.tenantId);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploadStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Get upload statistics
      const stats = await uploadService.getUploadStats(req.user.tenantId);

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