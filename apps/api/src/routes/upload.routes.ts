import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { 
  uploadSingle, 
  uploadMultiple, 
  handleUploadError 
} from '../middlewares/upload.middleware';
import { uploadController } from '../controllers/upload.controller';

const router = Router();

// Single file upload
router.post(
  '/single',
  authenticate,
  uploadSingle('file'),
  uploadController.uploadSingle.bind(uploadController),
  handleUploadError
);

// Multiple files upload
router.post(
  '/multiple',
  authenticate,
  uploadMultiple('files', 10), // Max 10 files
  uploadController.uploadMultiple.bind(uploadController),
  handleUploadError
);

// Property images upload
router.post(
  '/properties/:propertyId/images',
  authenticate,
  authorize(['ADMIN', 'AGENT']),
  uploadMultiple('images', 20), // Max 20 images
  uploadController.uploadPropertyImages.bind(uploadController),
  handleUploadError
);

// OCR document upload
router.post(
  '/ocr/document',
  authenticate,
  uploadSingle('document'),
  uploadController.uploadOcrDocument.bind(uploadController),
  handleUploadError
);

// Get file metadata
router.get(
  '/files/:fileId',
  authenticate,
  uploadController.getFileMetadata.bind(uploadController)
);

// Delete file
router.delete(
  '/files/:fileId',
  authenticate,
  authorize(['ADMIN', 'AGENT']),
  uploadController.deleteFile.bind(uploadController)
);

// Development only: serve in-memory files
if (process.env.USE_DEV_DATA === 'true') {
  router.get(
    '/dev/files/:fileId',
    uploadController.serveInMemoryFile.bind(uploadController)
  );
}

export default router;