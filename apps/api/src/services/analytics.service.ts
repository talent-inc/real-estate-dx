import { AppError } from '../middlewares/error.middleware';
import type { 
  AnalyticsQuery, 
  PropertyAnalyticsQuery, 
  InquiryAnalyticsQuery, 
  UserAnalyticsQuery, 
  ReportGenerationRequest, 
  DashboardConfig 
} from '../validators/analytics.validators';

// Mock analytics data structures
interface AnalyticsMetric {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

interface Report {
  id: string;
  tenantId: string;
  reportType: string;
  generatedAt: Date;
  format: string;
  filePath?: string;
  data: any;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

interface DashboardWidget {
  id: string;
  tenantId: string;
  type: string;
  title: string;
  config: Record<string, any>;
  data?: any;
  lastUpdated: Date;
}

// Global storage
declare global {
  var analyticsReports: Report[];
  var dashboardWidgets: DashboardWidget[];
}

if (!global.analyticsReports) {
  global.analyticsReports = [];
}

if (!global.dashboardWidgets) {
  global.dashboardWidgets = [];
}

let reportIdCounter = 1;
let widgetIdCounter = 1;

export class AnalyticsService {
  // General analytics overview
  async getAnalyticsOverview(tenantId: string, query: AnalyticsQuery): Promise<{
    summary: {
      totalProperties: number;
      totalInquiries: number;
      totalUsers: number;
      conversionRate: number;
    };
    trends: {
      properties: AnalyticsMetric[];
      inquiries: AnalyticsMetric[];
      users: AnalyticsMetric[];
      conversions: AnalyticsMetric[];
    };
    topMetrics: {
      topPropertyTypes: Array<{ type: string; count: number }>;
      topRegions: Array<{ region: string; count: number }>;
      topAgents: Array<{ agentName: string; inquiries: number }>;
    };
  }> {
    // Mock data generation based on date range
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();
    
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate mock trends data
    const properties = this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 20, 100);
    const inquiries = this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 5, 50);
    const users = this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 1, 20);
    const conversions = this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 0.1, 0.3);

    return {
      summary: {
        totalProperties: 245 + Math.floor(Math.random() * 100),
        totalInquiries: 89 + Math.floor(Math.random() * 50),
        totalUsers: 34 + Math.floor(Math.random() * 20),
        conversionRate: 0.15 + Math.random() * 0.1,
      },
      trends: {
        properties,
        inquiries,
        users,
        conversions,
      },
      topMetrics: {
        topPropertyTypes: [
          { type: 'APARTMENT', count: 120 },
          { type: 'HOUSE', count: 85 },
          { type: 'LAND', count: 40 },
        ],
        topRegions: [
          { region: '東京都', count: 98 },
          { region: '大阪府', count: 76 },
          { region: '神奈川県', count: 71 },
        ],
        topAgents: [
          { agentName: '田中太郎', inquiries: 23 },
          { agentName: '佐藤花子', inquiries: 19 },
          { agentName: '鈴木一郎', inquiries: 16 },
        ],
      },
    };
  }

  // Property-specific analytics
  async getPropertyAnalytics(tenantId: string, query: PropertyAnalyticsQuery): Promise<{
    totalProperties: number;
    averagePrice: number;
    priceDistribution: Array<{ range: string; count: number }>;
    performanceByType: Array<{ type: string; views: number; inquiries: number; conversionRate: number }>;
    regionalAnalysis: Array<{ region: string; properties: number; averagePrice: number }>;
    trends: {
      listings: AnalyticsMetric[];
      prices: AnalyticsMetric[];
      views: AnalyticsMetric[];
    };
  }> {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    return {
      totalProperties: 245,
      averagePrice: 45000000,
      priceDistribution: [
        { range: '0-20M', count: 45 },
        { range: '20-40M', count: 67 },
        { range: '40-60M', count: 89 },
        { range: '60-80M', count: 32 },
        { range: '80M+', count: 12 },
      ],
      performanceByType: [
        { type: 'APARTMENT', views: 1240, inquiries: 89, conversionRate: 0.072 },
        { type: 'HOUSE', views: 980, inquiries: 67, conversionRate: 0.068 },
        { type: 'LAND', views: 450, inquiries: 23, conversionRate: 0.051 },
      ],
      regionalAnalysis: [
        { region: '東京都', properties: 98, averagePrice: 52000000 },
        { region: '大阪府', properties: 76, averagePrice: 38000000 },
        { region: '神奈川県', properties: 71, averagePrice: 41000000 },
      ],
      trends: {
        listings: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 15, 35),
        prices: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 40000000, 50000000),
        views: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 800, 1500),
      },
    };
  }

  // Inquiry-specific analytics
  async getInquiryAnalytics(tenantId: string, query: InquiryAnalyticsQuery): Promise<{
    totalInquiries: number;
    averageResponseTime: number;
    statusDistribution: Array<{ status: string; count: number; percentage: number }>;
    sourceDistribution: Array<{ source: string; count: number; percentage: number }>;
    agentPerformance: Array<{ agentId: string; agentName: string; inquiries: number; responseTime: number }>;
    trends: {
      inquiries: AnalyticsMetric[];
      responseTime: AnalyticsMetric[];
      conversions: AnalyticsMetric[];
    };
  }> {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    return {
      totalInquiries: 234,
      averageResponseTime: 4.2, // hours
      statusDistribution: [
        { status: 'PENDING', count: 23, percentage: 9.8 },
        { status: 'IN_PROGRESS', count: 45, percentage: 19.2 },
        { status: 'RESPONDED', count: 134, percentage: 57.3 },
        { status: 'CLOSED', count: 32, percentage: 13.7 },
      ],
      sourceDistribution: [
        { source: 'WEBSITE', count: 156, percentage: 66.7 },
        { source: 'PHONE', count: 45, percentage: 19.2 },
        { source: 'EMAIL', count: 21, percentage: 9.0 },
        { source: 'REFERRAL', count: 12, percentage: 5.1 },
      ],
      agentPerformance: [
        { agentId: 'agent_1', agentName: '田中太郎', inquiries: 45, responseTime: 3.2 },
        { agentId: 'agent_2', agentName: '佐藤花子', inquiries: 38, responseTime: 4.1 },
        { agentId: 'agent_3', agentName: '鈴木一郎', inquiries: 29, responseTime: 5.8 },
      ],
      trends: {
        inquiries: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 8, 25),
        responseTime: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 2, 8),
        conversions: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 0.05, 0.25),
      },
    };
  }

  // User activity analytics
  async getUserAnalytics(tenantId: string, query: UserAnalyticsQuery): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUserGrowth: number;
    usersByRole: Array<{ role: string; count: number }>;
    activityTrends: {
      logins: AnalyticsMetric[];
      propertyViews: AnalyticsMetric[];
      inquiries: AnalyticsMetric[];
    };
    engagementMetrics: {
      averageSessionDuration: number;
      pagesPerSession: number;
      bounceRate: number;
    };
  }> {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    return {
      totalUsers: 234,
      activeUsers: 189,
      newUserGrowth: 0.125, // 12.5% growth
      usersByRole: [
        { role: 'USER', count: 198 },
        { role: 'AGENT', count: 28 },
        { role: 'MANAGER', count: 6 },
        { role: 'TENANT_ADMIN', count: 2 },
      ],
      activityTrends: {
        logins: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 45, 120),
        propertyViews: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 200, 800),
        inquiries: this.generateMockTimeSeries(dateFrom, dateTo, query.groupBy, 10, 40),
      },
      engagementMetrics: {
        averageSessionDuration: 8.5, // minutes
        pagesPerSession: 4.2,
        bounceRate: 0.32, // 32%
      },
    };
  }

  // Report generation
  async generateReport(tenantId: string, reportRequest: ReportGenerationRequest): Promise<{
    reportId: string;
    status: string;
    estimatedCompletionTime: Date;
  }> {
    const report: Report = {
      id: `report_${reportIdCounter++}`,
      tenantId,
      reportType: reportRequest.reportType,
      generatedAt: new Date(),
      format: reportRequest.format,
      data: null,
      status: 'GENERATING',
    };

    global.analyticsReports.push(report);

    // Simulate report generation
    setTimeout(() => {
      this.completeReportGeneration(report.id, reportRequest);
    }, 3000);

    return {
      reportId: report.id,
      status: 'GENERATING',
      estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };
  }

  async getReport(reportId: string, tenantId: string): Promise<Report | null> {
    const report = global.analyticsReports.find(r => r.id === reportId && r.tenantId === tenantId);
    return report || null;
  }

  async getReports(tenantId: string): Promise<Report[]> {
    return global.analyticsReports
      .filter(r => r.tenantId === tenantId)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  // Dashboard configuration
  async saveDashboardConfig(tenantId: string, config: DashboardConfig): Promise<void> {
    // For each widget, create or update widget data
    for (const widget of config.widgets) {
      const existingWidgetIndex = global.dashboardWidgets.findIndex(
        w => w.id === widget.id && w.tenantId === tenantId
      );

      const widgetData: DashboardWidget = {
        id: widget.id,
        tenantId,
        type: widget.type,
        title: widget.title,
        config: widget.config,
        data: await this.generateWidgetData(widget.type, widget.config),
        lastUpdated: new Date(),
      };

      if (existingWidgetIndex >= 0) {
        global.dashboardWidgets[existingWidgetIndex] = widgetData;
      } else {
        global.dashboardWidgets.push(widgetData);
      }
    }
  }

  async getDashboardData(tenantId: string): Promise<DashboardWidget[]> {
    return global.dashboardWidgets.filter(w => w.tenantId === tenantId);
  }

  async refreshDashboardWidget(widgetId: string, tenantId: string): Promise<DashboardWidget | null> {
    const widgetIndex = global.dashboardWidgets.findIndex(
      w => w.id === widgetId && w.tenantId === tenantId
    );

    if (widgetIndex === -1) {
      return null;
    }

    const widget = global.dashboardWidgets[widgetIndex];
    
    if (!widget) {
      return null;
    }
    
    widget.data = await this.generateWidgetData(widget.type, widget.config);
    widget.lastUpdated = new Date();

    return widget;
  }

  // Helper methods
  private generateMockTimeSeries(
    dateFrom: Date, 
    dateTo: Date, 
    groupBy: string, 
    minValue: number, 
    maxValue: number
  ): AnalyticsMetric[] {
    const data: AnalyticsMetric[] = [];
    const current = new Date(dateFrom);
    
    while (current <= dateTo) {
      const value = minValue + Math.random() * (maxValue - minValue);
      data.push({
        date: current.toISOString().split('T')[0]!,
        value: Math.round(value * 100) / 100,
      });

      // Increment based on groupBy
      switch (groupBy) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarter':
          current.setMonth(current.getMonth() + 3);
          break;
        case 'year':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }

    return data;
  }

  private async generateWidgetData(type: string, config: Record<string, any>): Promise<any> {
    switch (type) {
      case 'CHART':
        return {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [{
            label: config.dataLabel || 'データ',
            data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
            backgroundColor: config.backgroundColor || 'rgba(54, 162, 235, 0.2)',
            borderColor: config.borderColor || 'rgba(54, 162, 235, 1)',
          }],
        };
      case 'METRIC':
        return {
          value: Math.floor(Math.random() * 1000),
          change: (Math.random() - 0.5) * 0.2, // -10% to +10%
          trend: Math.random() > 0.5 ? 'up' : 'down',
        };
      case 'TABLE':
        return {
          headers: ['項目', '値', '変化'],
          rows: [
            ['物件数', '245', '+12'],
            ['問い合わせ', '89', '+5'],
            ['ユーザー', '234', '+18'],
          ],
        };
      default:
        return {};
    }
  }

  private completeReportGeneration(reportId: string, reportRequest: ReportGenerationRequest): void {
    const reportIndex = global.analyticsReports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
      const report = global.analyticsReports[reportIndex];
      
      if (!report) {
        return;
      }
      
      // Generate mock report data based on type
      const reportData = this.generateReportData(reportRequest.reportType);
      
      global.analyticsReports[reportIndex] = {
        ...report,
        status: 'COMPLETED',
        data: reportData,
        filePath: reportRequest.format === 'PDF' ? `/reports/${reportId}.pdf` : undefined,
      };
    }
  }

  private generateReportData(reportType: string): any {
    switch (reportType) {
      case 'OVERVIEW':
        return {
          summary: '総合分析レポート',
          metrics: {
            totalProperties: 245,
            totalInquiries: 89,
            conversionRate: 0.15,
          },
          charts: ['property_trends', 'inquiry_trends'],
        };
      case 'PROPERTY_PERFORMANCE':
        return {
          summary: '物件パフォーマンス分析',
          topPerformers: [
            { propertyId: 'prop_1', views: 150, inquiries: 12 },
            { propertyId: 'prop_2', views: 134, inquiries: 10 },
          ],
        };
      default:
        return { message: 'レポートが生成されました' };
    }
  }
}