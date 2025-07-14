import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional().default('month'),
  metrics: z.array(z.enum(['properties', 'inquiries', 'users', 'revenue', 'conversions'])).optional(),
});

export const propertyAnalyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional().default('month'),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'OFFICE', 'SHOP', 'WAREHOUSE', 'OTHER']).optional(),
  region: z.string().optional(),
  priceRange: z.object({
    min: z.number().int().positive().optional(),
    max: z.number().int().positive().optional(),
  }).optional(),
});

export const inquiryAnalyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional().default('week'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'RESPONDED', 'CLOSED']).optional(),
  source: z.enum(['WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'EXTERNAL_SYSTEM', 'OTHER']).optional(),
  agentId: z.string().optional(),
});

export const userAnalyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional().default('week'),
  role: z.enum(['TENANT_ADMIN', 'MANAGER', 'AGENT', 'USER']).optional(),
  activityType: z.enum(['login', 'property_view', 'inquiry_create', 'inquiry_response']).optional(),
});

export const reportGenerationSchema = z.object({
  reportType: z.enum(['OVERVIEW', 'PROPERTY_PERFORMANCE', 'INQUIRY_SUMMARY', 'USER_ACTIVITY', 'REVENUE_ANALYSIS', 'CUSTOM']),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  format: z.enum(['JSON', 'CSV', 'PDF']).optional().default('JSON'),
  includeCharts: z.boolean().optional().default(true),
  customMetrics: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
});

export const dashboardConfigSchema = z.object({
  widgets: z.array(z.object({
    id: z.string(),
    type: z.enum(['CHART', 'METRIC', 'TABLE', 'MAP']),
    title: z.string(),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
    position: z.object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
    config: z.record(z.any()),
  })),
  layout: z.enum(['GRID', 'FLEXIBLE']).optional().default('GRID'),
  refreshInterval: z.number().int().positive().optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type PropertyAnalyticsQuery = z.infer<typeof propertyAnalyticsQuerySchema>;
export type InquiryAnalyticsQuery = z.infer<typeof inquiryAnalyticsQuerySchema>;
export type UserAnalyticsQuery = z.infer<typeof userAnalyticsQuerySchema>;
export type ReportGenerationRequest = z.infer<typeof reportGenerationSchema>;
export type DashboardConfig = z.infer<typeof dashboardConfigSchema>;