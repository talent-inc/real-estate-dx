import { Request, Response, NextFunction } from 'express';
import { storageService } from '../lib/storage';
import { AppError } from '../middlewares/error.middleware';
import type { JWTPayload } from '../utils/jwt';

interface UploadRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  user?: JWTPayload;
}

export class UploadController {
  /**
   * Upload a single file
   */
  async uploadSingle(req: UploadRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, 'No file uploaded', 'NO_FILE');
      }

      const { folder, isPublic } = req.body;
      
      const uploadedFile = await storageService.uploadFile(req.file, {
        folder: folder || `tenants/${req.user?.tenantId}`,
        isPublic: isPublic === 'true',
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: uploadedFile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(req: UploadRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        throw new AppError(400, 'No files uploaded', 'NO_FILES');
      }

      const { folder, isPublic } = req.body;
      
      const uploadPromises = files.map(file => 
        storageService.uploadFile(file, {
          folder: folder || `tenants/${req.user?.tenantId}`,
          isPublic: isPublic === 'true',
        })
      );

      const uploadedFiles = await Promise.all(uploadPromises);

      res.status(201).json({
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload property images
   */
  async uploadPropertyImages(req: UploadRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const { propertyId } = req.params;
      
      if (!files || files.length === 0) {
        throw new AppError(400, 'No images uploaded', 'NO_IMAGES');
      }

      // Validate image files
      const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidFiles = files.filter(file => !imageTypes.includes(file.mimetype));
      
      if (invalidFiles.length > 0) {
        throw new AppError(400, 'Only image files are allowed', 'INVALID_IMAGE_TYPE');
      }

      const uploadPromises = files.map(file => 
        storageService.uploadFile(file, {
          folder: `properties/${propertyId}/images`,
          isPublic: true,
        })
      );

      const uploadedImages = await Promise.all(uploadPromises);

      res.status(201).json({
        message: `${uploadedImages.length} images uploaded successfully`,
        images: uploadedImages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload OCR document
   */
  async uploadOcrDocument(req: UploadRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, 'No document uploaded', 'NO_DOCUMENT');
      }

      // Validate document type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new AppError(400, 'Invalid document type. Only PDF and images are allowed', 'INVALID_DOCUMENT_TYPE');
      }

      const uploadedFile = await storageService.uploadFile(req.file, {
        bucket: 'documents',
        folder: `ocr/${req.user?.tenantId}`,
        isPublic: false,
      });

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: uploadedFile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      
      if (!fileId) {
        throw new AppError(400, 'File ID is required', 'VALIDATION_ERROR');
      }
      
      const metadata = await storageService.getFileMetadata(fileId);
      
      if (!metadata) {
        throw new AppError(404, 'File not found', 'FILE_NOT_FOUND');
      }

      res.json(metadata);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(req: UploadRequest, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      
      if (!fileId) {
        throw new AppError(400, 'File ID is required', 'VALIDATION_ERROR');
      }
      
      await storageService.deleteFile(fileId);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Serve in-memory file (development only)
   */
  async serveInMemoryFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (process.env.USE_DEV_DATA !== 'true') {
        throw new AppError(404, 'Not found', 'NOT_FOUND');
      }

      const { fileId } = req.params;
      
      if (!fileId) {
        throw new AppError(400, 'File ID is required', 'VALIDATION_ERROR');
      }
      
      const file = storageService.getInMemoryFile(fileId);
      
      if (!file) {
        throw new AppError(404, 'File not found', 'FILE_NOT_FOUND');
      }

      res.json({
        message: 'In-memory file placeholder',
        file,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();