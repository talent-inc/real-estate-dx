import { Router } from 'express';
import { ExternalSystemController } from '../controllers/external-system.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const externalSystemController = new ExternalSystemController();

// Apply authentication to all external system routes
router.use(authenticate);

// External system management routes
router.get('/', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.getExternalSystems.bind(externalSystemController));
router.get('/:id', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.getExternalSystemById.bind(externalSystemController));
router.post('/', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.createExternalSystemAuth.bind(externalSystemController));
router.put('/:id', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.updateExternalSystemAuth.bind(externalSystemController));
router.delete('/:id', requireRole(['TENANT_ADMIN']), externalSystemController.deleteExternalSystemAuth.bind(externalSystemController));

// Connection testing
router.post('/test', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.testConnection.bind(externalSystemController));
router.post('/:id/test', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.testExistingConnection.bind(externalSystemController));

// Synchronization
router.post('/:id/sync', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.startSync.bind(externalSystemController));
router.get('/sync/status/:syncId', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.getSyncStatus.bind(externalSystemController));
router.get('/sync/history', requireRole(['TENANT_ADMIN', 'MANAGER']), externalSystemController.getSyncHistory.bind(externalSystemController));

export default router;