import type { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AppError } from '../middlewares/error.middleware';
import {
  analyticsQuerySchema,
  propertyAnalyticsQuerySchema,
  inquiryAnalyticsQuerySchema,
  userAnalyticsQuerySchema,
  reportGenerationSchema,
  dashboardConfigSchema,
  type AnalyticsQuery,
  type PropertyAnalyticsQuery,
  type InquiryAnalyticsQuery,
  type UserAnalyticsQuery,
  type ReportGenerationRequest,
  type DashboardConfig,
} from '../validators/analytics.validators';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getAnalyticsOverview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate query parameters
      const queryParams = analyticsQuerySchema.parse(req.query) as AnalyticsQuery;
      
      // Get analytics overview
      const overview = await analyticsService.getAnalyticsOverview(req.user.tenantId, queryParams);
      
      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate query parameters
      const queryParams = propertyAnalyticsQuerySchema.parse(req.query) as PropertyAnalyticsQuery;
      
      // Get property analytics
      const analytics = await analyticsService.getPropertyAnalytics(req.user.tenantId, queryParams);
      
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInquiryAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate query parameters
      const queryParams = inquiryAnalyticsQuerySchema.parse(req.query) as InquiryAnalyticsQuery;
      
      // Get inquiry analytics
      const analytics = await analyticsService.getInquiryAnalytics(req.user.tenantId, queryParams);
      
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate query parameters
      const queryParams = userAnalyticsQuerySchema.parse(req.query) as UserAnalyticsQuery;
      
      // Get user analytics
      const analytics = await analyticsService.getUserAnalytics(req.user.tenantId, queryParams);
      
      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate request body
      const validatedData = reportGenerationSchema.parse(req.body) as ReportGenerationRequest;
      
      // Generate report
      const result = await analyticsService.generateReport(req.user.tenantId, validatedData);
      
      res.status(202).json({
        success: true,
        data: result,
        message: 'Report generation started',
      });
    } catch (error) {
      next(error);
    }
  }

  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { reportId } = req.params;
      
      if (!reportId) {
        throw new AppError(400, 'Report ID is required', 'VALIDATION_ERROR');
      }

      // Get report
      const report = await analyticsService.getReport(reportId, req.user.tenantId);
      
      if (!report) {
        throw new AppError(404, 'Report not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Get reports
      const reports = await analyticsService.getReports(req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: { reports },
      });
    } catch (error) {
      next(error);
    }
  }

  async saveDashboardConfig(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Validate request body
      const validatedData = dashboardConfigSchema.parse(req.body) as DashboardConfig;
      
      // Save dashboard configuration
      await analyticsService.saveDashboardConfig(req.user.tenantId, validatedData);
      
      res.status(200).json({
        success: true,
        message: 'Dashboard configuration saved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      // Get dashboard data
      const widgets = await analyticsService.getDashboardData(req.user.tenantId);
      
      res.status(200).json({
        success: true,
        data: { widgets },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshDashboardWidget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { widgetId } = req.params;
      
      if (!widgetId) {
        throw new AppError(400, 'Widget ID is required', 'VALIDATION_ERROR');
      }

      // Refresh widget data
      const widget = await analyticsService.refreshDashboardWidget(widgetId, req.user.tenantId);
      
      if (!widget) {
        throw new AppError(404, 'Widget not found', 'NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: { widget },
      });
    } catch (error) {
      next(error);
    }
  }

  async getChartData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required', 'AUTHENTICATION_ERROR');
      }

      const { chartType } = req.params;
      const queryParams = analyticsQuerySchema.parse(req.query) as AnalyticsQuery;
      
      if (!chartType) {
        throw new AppError(400, 'Chart type is required', 'VALIDATION_ERROR');
      }

      let chartData;
      
      switch (chartType) {
        case 'property-trends':
          const propertyData = await analyticsService.getPropertyAnalytics(req.user.tenantId, queryParams);
          chartData = {
            labels: propertyData.trends.listings.map(item => item.date),
            datasets: [{
              label: '物件登録数',
              data: propertyData.trends.listings.map(item => item.value),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
            }],
          };
          break;
          
        case 'inquiry-trends':
          const inquiryData = await analyticsService.getInquiryAnalytics(req.user.tenantId, queryParams);
          chartData = {
            labels: inquiryData.trends.inquiries.map(item => item.date),
            datasets: [{
              label: '問い合わせ数',
              data: inquiryData.trends.inquiries.map(item => item.value),
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
            }],
          };
          break;
          
        case 'user-activity':
          const userData = await analyticsService.getUserAnalytics(req.user.tenantId, queryParams);
          chartData = {
            labels: userData.activityTrends.logins.map(item => item.date),
            datasets: [
              {
                label: 'ログイン数',
                data: userData.activityTrends.logins.map(item => item.value),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
              },
              {
                label: '物件閲覧数',
                data: userData.activityTrends.propertyViews.map(item => item.value),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
              },
            ],
          };
          break;
          
        default:
          throw new AppError(400, 'Invalid chart type', 'VALIDATION_ERROR');
      }
      
      res.status(200).json({
        success: true,
        data: { chartData },
      });
    } catch (error) {
      next(error);
    }
  }
}