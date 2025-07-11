import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const propertyController = new PropertyController();

// Apply authentication to all property routes
router.use(authenticate);

// Property CRUD routes
router.get('/', propertyController.getProperties.bind(propertyController));
router.get('/stats', propertyController.getPropertyStats.bind(propertyController));
router.get('/:id', propertyController.getPropertyById.bind(propertyController));
router.post('/', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), propertyController.createProperty.bind(propertyController));
router.put('/:id', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), propertyController.updateProperty.bind(propertyController));
router.delete('/:id', requireRole(['TENANT_ADMIN', 'MANAGER']), propertyController.deleteProperty.bind(propertyController));

// Property image management
router.post('/:id/images', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), propertyController.addPropertyImage.bind(propertyController));
router.delete('/:id/images/:imageId', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), propertyController.removePropertyImage.bind(propertyController));

export default router;