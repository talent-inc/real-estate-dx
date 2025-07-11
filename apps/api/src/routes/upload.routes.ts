import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const uploadController = new UploadController();

// Apply authentication to all upload routes
router.use(authenticate);

// File upload routes
router.post('/images', uploadController.uploadImage.bind(uploadController));
router.post('/documents', uploadController.uploadDocument.bind(uploadController));

// File management routes
router.get('/', uploadController.getFiles.bind(uploadController));
router.get('/stats', uploadController.getUploadStats.bind(uploadController));
router.get('/:id', uploadController.getFile.bind(uploadController));
router.delete('/:id', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), uploadController.deleteFile.bind(uploadController));

export default router;