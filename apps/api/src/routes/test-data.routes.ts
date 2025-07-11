import { Router, Request, Response } from 'express';
import { TestDataService } from '../services/test-data.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { logger } from '../config/logger';

const router = Router();

// Middleware to check if test mode is enabled
const checkTestMode = (req: Request, res: Response, next: any) => {
  if (process.env.USE_DEV_DATA !== 'true') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Test data endpoints are only available in development mode',
        code: 'TEST_MODE_DISABLED'
      }
    });
  }
  next();
};

// Get all test data
router.get(
  '/all',
  checkTestMode,
  authenticate,
  authorize(['ADMIN']),
  (req: Request, res: Response) => {
    try {
      const data = TestDataService.getData();
      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Failed to get test data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve test data',
          code: 'TEST_DATA_ERROR'
        }
      });
    }
  }
);

// Get test data statistics
router.get(
  '/stats',
  checkTestMode,
  authenticate,
  (req: Request, res: Response) => {
    try {
      const stats = TestDataService.getStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get test data stats:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve test data statistics',
          code: 'TEST_DATA_STATS_ERROR'
        }
      });
    }
  }
);

// Reset test data
router.post(
  '/reset',
  checkTestMode,
  authenticate,
  authorize(['ADMIN']),
  async (req: Request, res: Response) => {
    try {
      await TestDataService.reset();
      res.json({
        success: true,
        message: 'Test data has been reset successfully'
      });
    } catch (error) {
      logger.error('Failed to reset test data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to reset test data',
          code: 'TEST_DATA_RESET_ERROR'
        }
      });
    }
  }
);

// Initialize test data (usually called on server startup)
router.post(
  '/initialize',
  checkTestMode,
  authenticate,
  authorize(['ADMIN']),
  async (req: Request, res: Response) => {
    try {
      await TestDataService.initialize();
      res.json({
        success: true,
        message: 'Test data initialized successfully'
      });
    } catch (error) {
      logger.error('Failed to initialize test data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to initialize test data',
          code: 'TEST_DATA_INIT_ERROR'
        }
      });
    }
  }
);

// Clear all test data
router.delete(
  '/clear',
  checkTestMode,
  authenticate,
  authorize(['ADMIN']),
  (req: Request, res: Response) => {
    try {
      TestDataService.clear();
      res.json({
        success: true,
        message: 'Test data has been cleared'
      });
    } catch (error) {
      logger.error('Failed to clear test data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to clear test data',
          code: 'TEST_DATA_CLEAR_ERROR'
        }
      });
    }
  }
);

// Get specific test data by type
router.get(
  '/:type',
  checkTestMode,
  authenticate,
  (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      let data: any;

      switch (type) {
        case 'users':
          data = TestDataService.getUsers();
          break;
        case 'properties':
          data = TestDataService.getProperties();
          break;
        case 'ocr-jobs':
          data = TestDataService.getOcrJobs();
          break;
        case 'inquiries':
          data = TestDataService.getInquiries();
          break;
        default:
          return res.status(400).json({
            success: false,
            error: {
              message: 'Invalid data type. Valid types are: users, properties, ocr-jobs, inquiries',
              code: 'INVALID_DATA_TYPE'
            }
          });
      }

      res.json({
        success: true,
        data,
        count: data.length
      });
    } catch (error) {
      logger.error('Failed to get test data by type:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve test data',
          code: 'TEST_DATA_ERROR'
        }
      });
    }
  }
);

export default router;