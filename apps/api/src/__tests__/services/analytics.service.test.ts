import { AnalyticsService } from '../../services/analytics.service';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    global.analyticsReports = [];
    global.dashboardWidgets = [];
    global.reportIdCounter = 1;
    global.widgetIdCounter = 1;
  });

  describe('getAnalyticsOverview', () => {
    it('should get analytics overview with mock data', async () => {
      const query = {
        dateFrom: '2023-01-01T00:00:00.000Z',
        dateTo: '2023-12-31T23:59:59.999Z',
        groupBy: 'month' as const,
      };

      const result = await analyticsService.getAnalyticsOverview('tenant1', query);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalProperties).toBeGreaterThan(0);
      expect(result.summary.totalInquiries).toBeGreaterThan(0);
      expect(result.summary.totalUsers).toBeGreaterThan(0);
      expect(result.summary.conversionRate).toBeGreaterThan(0);

      expect(result.trends).toBeDefined();
      expect(result.trends.properties).toBeInstanceOf(Array);
      expect(result.trends.inquiries).toBeInstanceOf(Array);
      expect(result.trends.users).toBeInstanceOf(Array);
      expect(result.trends.conversions).toBeInstanceOf(Array);

      expect(result.topMetrics).toBeDefined();
      expect(result.topMetrics.topPropertyTypes).toBeInstanceOf(Array);
      expect(result.topMetrics.topRegions).toBeInstanceOf(Array);
      expect(result.topMetrics.topAgents).toBeInstanceOf(Array);
    });

    it('should generate time series data based on groupBy parameter', async () => {
      const weeklyQuery = { groupBy: 'week' as const };
      const monthlyQuery = { groupBy: 'month' as const };

      const weeklyResult = await analyticsService.getAnalyticsOverview('tenant1', weeklyQuery);
      const monthlyResult = await analyticsService.getAnalyticsOverview('tenant1', monthlyQuery);

      expect(weeklyResult.trends.properties.length).toBeGreaterThan(0);
      expect(monthlyResult.trends.properties.length).toBeGreaterThan(0);
      
      // Weekly should have more data points than monthly for same period
      expect(weeklyResult.trends.properties[0].date).toBeDefined();
      expect(monthlyResult.trends.properties[0].date).toBeDefined();
    });
  });

  describe('getPropertyAnalytics', () => {
    it('should get property analytics with detailed metrics', async () => {
      const query = {
        dateFrom: '2023-01-01T00:00:00.000Z',
        dateTo: '2023-12-31T23:59:59.999Z',
        groupBy: 'month' as const,
      };

      const result = await analyticsService.getPropertyAnalytics('tenant1', query);

      expect(result).toBeDefined();
      expect(result.totalProperties).toBeGreaterThan(0);
      expect(result.averagePrice).toBeGreaterThan(0);
      expect(result.priceDistribution).toBeInstanceOf(Array);
      expect(result.performanceByType).toBeInstanceOf(Array);
      expect(result.regionalAnalysis).toBeInstanceOf(Array);
      expect(result.trends).toBeDefined();
      expect(result.trends.listings).toBeInstanceOf(Array);
      expect(result.trends.prices).toBeInstanceOf(Array);
      expect(result.trends.views).toBeInstanceOf(Array);
    });

    it('should include property performance metrics', async () => {
      const query = {};
      const result = await analyticsService.getPropertyAnalytics('tenant1', query);

      expect(result.performanceByType.length).toBeGreaterThan(0);
      result.performanceByType.forEach(performance => {
        expect(performance.type).toBeDefined();
        expect(performance.views).toBeGreaterThanOrEqual(0);
        expect(performance.inquiries).toBeGreaterThanOrEqual(0);
        expect(performance.conversionRate).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getInquiryAnalytics', () => {
    it('should get inquiry analytics with response metrics', async () => {
      const query = {
        dateFrom: '2023-01-01T00:00:00.000Z',
        dateTo: '2023-12-31T23:59:59.999Z',
        groupBy: 'week' as const,
      };

      const result = await analyticsService.getInquiryAnalytics('tenant1', query);

      expect(result).toBeDefined();
      expect(result.totalInquiries).toBeGreaterThan(0);
      expect(result.averageResponseTime).toBeGreaterThan(0);
      expect(result.statusDistribution).toBeInstanceOf(Array);
      expect(result.sourceDistribution).toBeInstanceOf(Array);
      expect(result.agentPerformance).toBeInstanceOf(Array);
      expect(result.trends).toBeDefined();
      expect(result.trends.inquiries).toBeInstanceOf(Array);
      expect(result.trends.responseTime).toBeInstanceOf(Array);
      expect(result.trends.conversions).toBeInstanceOf(Array);
    });

    it('should calculate percentages for distributions', async () => {
      const query = {};
      const result = await analyticsService.getInquiryAnalytics('tenant1', query);

      const statusTotal = result.statusDistribution.reduce((sum, item) => sum + item.percentage, 0);
      const sourceTotal = result.sourceDistribution.reduce((sum, item) => sum + item.percentage, 0);

      expect(Math.abs(statusTotal - 100)).toBeLessThan(0.1);
      expect(Math.abs(sourceTotal - 100)).toBeLessThan(0.1);
    });
  });

  describe('getUserAnalytics', () => {
    it('should get user analytics with engagement metrics', async () => {
      const query = {
        dateFrom: '2023-01-01T00:00:00.000Z',
        dateTo: '2023-12-31T23:59:59.999Z',
        groupBy: 'week' as const,
      };

      const result = await analyticsService.getUserAnalytics('tenant1', query);

      expect(result).toBeDefined();
      expect(result.totalUsers).toBeGreaterThan(0);
      expect(result.activeUsers).toBeGreaterThan(0);
      expect(result.newUserGrowth).toBeGreaterThanOrEqual(0);
      expect(result.usersByRole).toBeInstanceOf(Array);
      expect(result.activityTrends).toBeDefined();
      expect(result.engagementMetrics).toBeDefined();
      expect(result.engagementMetrics.averageSessionDuration).toBeGreaterThan(0);
      expect(result.engagementMetrics.pagesPerSession).toBeGreaterThan(0);
      expect(result.engagementMetrics.bounceRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateReport', () => {
    it('should generate report and return task info', async () => {
      const reportRequest = {
        reportType: 'OVERVIEW' as const,
        dateFrom: '2023-01-01T00:00:00.000Z',
        dateTo: '2023-12-31T23:59:59.999Z',
        format: 'JSON' as const,
        includeCharts: true,
      };

      const result = await analyticsService.generateReport('tenant1', reportRequest);

      expect(result).toBeDefined();
      expect(result.reportId).toBeDefined();
      expect(result.status).toBe('GENERATING');
      expect(result.estimatedCompletionTime).toBeInstanceOf(Date);
    });

    it('should store report in global storage', async () => {
      const reportRequest = {
        reportType: 'PROPERTY_PERFORMANCE' as const,
        dateFrom: '2023-01-01T00:00:00.000Z',
        dateTo: '2023-12-31T23:59:59.999Z',
        format: 'PDF' as const,
      };

      await analyticsService.generateReport('tenant1', reportRequest);

      expect(global.analyticsReports.length).toBe(1);
      expect(global.analyticsReports[0].tenantId).toBe('tenant1');
      expect(global.analyticsReports[0].reportType).toBe('PROPERTY_PERFORMANCE');
      expect(global.analyticsReports[0].format).toBe('PDF');
    });
  });

  describe('getReport', () => {
    beforeEach(async () => {
      // Generate a test report
      await analyticsService.generateReport('tenant1', {
        reportType: 'OVERVIEW',
        dateFrom: '2023-01-01T00:00:00.000Z',
        dateTo: '2023-12-31T23:59:59.999Z',
        format: 'JSON',
      });
    });

    it('should get report by id for correct tenant', async () => {
      const reports = await analyticsService.getReports('tenant1');
      const reportId = reports[0].id;

      const result = await analyticsService.getReport(reportId, 'tenant1');

      expect(result).toBeDefined();
      expect(result?.id).toBe(reportId);
      expect(result?.tenantId).toBe('tenant1');
    });

    it('should return null for report in different tenant', async () => {
      const reports = await analyticsService.getReports('tenant1');
      const reportId = reports[0].id;

      const result = await analyticsService.getReport(reportId, 'tenant2');

      expect(result).toBeNull();
    });
  });

  describe('saveDashboardConfig', () => {
    it('should save dashboard configuration with widgets', async () => {
      const config = {
        widgets: [
          {
            id: 'widget1',
            type: 'CHART' as const,
            title: 'Property Trends',
            size: 'LARGE' as const,
            position: { x: 0, y: 0, width: 6, height: 4 },
            config: { chartType: 'line', dataSource: 'properties' },
          },
          {
            id: 'widget2',
            type: 'METRIC' as const,
            title: 'Total Properties',
            size: 'SMALL' as const,
            position: { x: 6, y: 0, width: 3, height: 2 },
            config: { metric: 'totalProperties' },
          },
        ],
        layout: 'GRID' as const,
        refreshInterval: 300000,
      };

      await analyticsService.saveDashboardConfig('tenant1', config);

      expect(global.dashboardWidgets.length).toBe(2);
      expect(global.dashboardWidgets[0].tenantId).toBe('tenant1');
      expect(global.dashboardWidgets[0].type).toBe('CHART');
      expect(global.dashboardWidgets[1].type).toBe('METRIC');
    });
  });

  describe('getDashboardData', () => {
    beforeEach(async () => {
      // Save test dashboard config
      await analyticsService.saveDashboardConfig('tenant1', {
        widgets: [
          {
            id: 'widget1',
            type: 'CHART',
            title: 'Test Chart',
            size: 'MEDIUM',
            position: { x: 0, y: 0, width: 4, height: 3 },
            config: {},
          },
        ],
        layout: 'GRID',
      });
    });

    it('should get dashboard widgets for tenant', async () => {
      const result = await analyticsService.getDashboardData('tenant1');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0].tenantId).toBe('tenant1');
      expect(result[0].type).toBe('CHART');
      expect(result[0].data).toBeDefined();
    });

    it('should not return widgets from other tenants', async () => {
      // Add widget for different tenant
      await analyticsService.saveDashboardConfig('tenant2', {
        widgets: [
          {
            id: 'widget2',
            type: 'METRIC',
            title: 'Other Metric',
            size: 'SMALL',
            position: { x: 0, y: 0, width: 2, height: 2 },
            config: {},
          },
        ],
        layout: 'GRID',
      });

      const result = await analyticsService.getDashboardData('tenant1');

      expect(result.length).toBe(1);
      expect(result.every(widget => widget.tenantId === 'tenant1')).toBe(true);
    });
  });

  describe('refreshDashboardWidget', () => {
    beforeEach(async () => {
      await analyticsService.saveDashboardConfig('tenant1', {
        widgets: [
          {
            id: 'widget1',
            type: 'CHART',
            title: 'Test Chart',
            size: 'MEDIUM',
            position: { x: 0, y: 0, width: 4, height: 3 },
            config: {},
          },
        ],
        layout: 'GRID',
      });
    });

    it('should refresh widget data', async () => {
      const beforeRefresh = new Date();
      
      const result = await analyticsService.refreshDashboardWidget('widget1', 'tenant1');

      expect(result).toBeDefined();
      expect(result?.data).toBeDefined();
      expect(result?.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
    });

    it('should return null for non-existent widget', async () => {
      const result = await analyticsService.refreshDashboardWidget('nonexistent', 'tenant1');

      expect(result).toBeNull();
    });
  });
});