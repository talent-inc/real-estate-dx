import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Apply authentication to all analytics routes
router.use(authenticate);

// General analytics endpoints
router.get('/overview', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.getAnalyticsOverview.bind(analyticsController));

// Specific analytics endpoints
router.get('/properties', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.getPropertyAnalytics.bind(analyticsController));
router.get('/inquiries', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.getInquiryAnalytics.bind(analyticsController));
router.get('/users', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.getUserAnalytics.bind(analyticsController));

// Chart data endpoints
router.get('/charts/:chartType', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), analyticsController.getChartData.bind(analyticsController));

// Report generation and management
router.post('/reports', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.generateReport.bind(analyticsController));
router.get('/reports', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.getReports.bind(analyticsController));
router.get('/reports/:reportId', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.getReport.bind(analyticsController));

// Dashboard configuration
router.post('/dashboard/config', requireRole(['TENANT_ADMIN', 'MANAGER']), analyticsController.saveDashboardConfig.bind(analyticsController));
router.get('/dashboard/data', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), analyticsController.getDashboardData.bind(analyticsController));
router.post('/dashboard/widgets/:widgetId/refresh', requireRole(['TENANT_ADMIN', 'MANAGER', 'AGENT']), analyticsController.refreshDashboardWidget.bind(analyticsController));

export default router;