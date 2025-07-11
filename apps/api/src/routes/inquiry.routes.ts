import { Router } from 'express';
import { InquiryController } from '../controllers/inquiry.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const inquiryController = new InquiryController();

// Public route for inquiry submission (no authentication required)
router.post('/public', inquiryController.createPublicInquiry.bind(inquiryController));

// Apply authentication to management routes
router.use(authenticate);

// Inquiry management routes
router.get('/', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), inquiryController.getInquiries.bind(inquiryController));
router.get('/stats', requireRole(['TENANT_ADMIN', 'MANAGER']), inquiryController.getInquiryStats.bind(inquiryController));
router.get('/:id', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), inquiryController.getInquiryById.bind(inquiryController));
router.post('/', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), inquiryController.createInquiry.bind(inquiryController));
router.put('/:id', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), inquiryController.updateInquiry.bind(inquiryController));
router.delete('/:id', requireRole(['TENANT_ADMIN', 'MANAGER']), inquiryController.deleteInquiry.bind(inquiryController));

// Inquiry response and assignment
router.post('/:id/respond', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), inquiryController.respondToInquiry.bind(inquiryController));
router.post('/:id/assign', requireRole(['TENANT_ADMIN', 'MANAGER']), inquiryController.assignInquiry.bind(inquiryController));

export default router;