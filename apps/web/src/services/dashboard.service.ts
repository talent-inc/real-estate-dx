import { apiClient } from '@/lib/api-client'
import { ApiResponse } from '@/types/api'

// ダッシュボード統計データの型定義
export interface DashboardStats {
  summary: {
    totalProperties: number
    activeProperties: number
    totalInquiries: number
    newInquiriesThisWeek: number
  }
  charts: {
    propertiesByType: Array<{ type: string, count: number }>
    inquiriesByMonth: Array<{ month: string, count: number }>
  }
}

export interface RecentActivity {
  id: string
  type: 'property_created' | 'property_updated' | 'inquiry_received' | 'ocr_completed'
  title: string
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  href: string
  color: string
}

export class DashboardService {
  // ダッシュボード統計取得
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/analytics/dashboard')
    
    if (!response.success || !response.data) {
      throw new Error('ダッシュボード統計の取得に失敗しました')
    }
    
    return response.data
  }

  // 最近のアクティビティ取得
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    const response = await apiClient.get<RecentActivity[]>(`/activities/recent?limit=${limit}`)
    
    if (!response.success || !response.data) {
      throw new Error('最近のアクティビティの取得に失敗しました')
    }
    
    return response.data
  }

  // 通知一覧取得
  async getNotifications(params?: {
    unreadOnly?: boolean
    limit?: number
    page?: number
  }): Promise<{
    notifications: Array<{
      id: string
      title: string
      message: string
      type: 'info' | 'warning' | 'error' | 'success'
      isRead: boolean
      createdAt: string
    }>
    unreadCount: number
    total: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    
    const url = queryParams.toString() ? `/notifications?${queryParams.toString()}` : '/notifications'
    const response = await apiClient.get(url)
    
    if (!response.success) {
      throw new Error('通知一覧の取得に失敗しました')
    }
    
    return response.data || {
      notifications: [],
      unreadCount: 0,
      total: 0
    }
  }

  // 通知を既読にマーク
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.put(`/notifications/${notificationId}/read`)
    
    if (!response.success) {
      throw new Error('通知の既読処理に失敗しました')
    }
  }

  // 全通知を既読にマーク
  async markAllNotificationsAsRead(): Promise<void> {
    const response = await apiClient.put('/notifications/read-all')
    
    if (!response.success) {
      throw new Error('全通知の既読処理に失敗しました')
    }
  }

  // クイックアクション取得
  getQuickActions(): QuickAction[] {
    return [
      {
        id: 'new-property',
        title: '新規物件登録',
        description: '新しい物件を登録します',
        icon: 'Plus',
        href: '/properties/new',
        color: 'bg-blue-500'
      },
      {
        id: 'ocr-process',
        title: 'AI-OCR処理',
        description: '文書をAIで解析します',
        icon: 'FileText',
        href: '/ocr',
        color: 'bg-green-500'
      },
      {
        id: 'property-search',
        title: '物件検索',
        description: '物件を検索・閲覧します',
        icon: 'Search',
        href: '/properties',
        color: 'bg-purple-500'
      },
      {
        id: 'analytics',
        title: 'レポート・分析',
        description: '売上や物件の分析を確認',
        icon: 'BarChart3',
        href: '/analytics',
        color: 'bg-orange-500'
      }
    ]
  }

  // システム使用量統計取得
  async getUsageStats(): Promise<{
    users: { current: number, limit: number, usage: number }
    properties: { current: number, limit: number, usage: number }
    storage: { current: number, limit: number, usage: number }
    ocrProcessing: { thisMonth: number, limit: number, usage: number }
  }> {
    const response = await apiClient.get('/tenants/usage')
    
    if (!response.success || !response.data) {
      throw new Error('使用量統計の取得に失敗しました')
    }
    
    return response.data ?? {
      users: { current: 0, limit: 100, usage: 0 },
      properties: { current: 0, limit: 1000, usage: 0 },
      storage: { current: 0, limit: 10240, usage: 0 },
      ocrProcessing: { thisMonth: 0, limit: 500, usage: 0 }
    }
  }

  // 物件分析データ取得
  async getPropertyAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    totalRevenue: number
    averagePrice: number
    soldProperties: number
    averageDaysOnMarket: number
    trends: Array<{
      period: string
      revenue: number
      sold: number
      listed: number
    }>
  }> {
    const response = await apiClient.get(`/analytics/properties?period=${period}`)
    
    if (!response.success || !response.data) {
      throw new Error('物件分析データの取得に失敗しました')
    }
    
    return response.data ?? {
      totalRevenue: 0,
      averagePrice: 0,
      soldProperties: 0,
      averageDaysOnMarket: 0,
      trends: []
    }
  }

  // 売上分析データ取得
  async getSalesAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    totalSales: number
    commission: number
    averageCommissionRate: number
    topPerformers: Array<{
      agentName: string
      sales: number
      commission: number
    }>
    monthlySales: Array<{
      month: string
      sales: number
      commission: number
    }>
  }> {
    const response = await apiClient.get(`/analytics/sales?period=${period}`)
    
    if (!response.success || !response.data) {
      throw new Error('売上分析データの取得に失敗しました')
    }
    
    return response.data ?? {
      totalSales: 0,
      commission: 0,
      averageCommissionRate: 0,
      topPerformers: [],
      monthlySales: []
    }
  }
}

// シングルトンインスタンス
export const dashboardService = new DashboardService()