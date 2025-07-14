import { apiClient } from '@/lib/api-client'
import { 
  Property, 
  PropertyListParams, 
  PropertyListResponse, 
  PropertyCreateRequest, 
  PropertyUpdateRequest 
} from '@/types/property'
import { ApiResponse } from '@/types/api'

export class PropertyService {
  // 物件一覧取得
  async getProperties(params?: PropertyListParams): Promise<PropertyListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })
    }
    
    const url = queryParams.toString() ? `/properties?${queryParams.toString()}` : '/properties'
    const response = await apiClient.get<PropertyListResponse>(url)
    
    if (!response.success || !response.data) {
      throw new Error('物件一覧の取得に失敗しました')
    }
    
    return response.data
  }

  // 物件詳細取得
  async getProperty(id: string): Promise<Property> {
    const response = await apiClient.get<Property>(`/properties/${id}`)
    
    if (!response.success || !response.data) {
      throw new Error('物件詳細の取得に失敗しました')
    }
    
    return response.data
  }

  // 物件作成
  async createProperty(data: PropertyCreateRequest): Promise<Property> {
    const response = await apiClient.post<Property>('/properties', data)
    
    if (!response.success || !response.data) {
      throw new Error('物件の作成に失敗しました')
    }
    
    return response.data
  }

  // 物件更新
  async updateProperty(id: string, data: PropertyUpdateRequest): Promise<Property> {
    const response = await apiClient.put<Property>(`/properties/${id}`, data)
    
    if (!response.success || !response.data) {
      throw new Error('物件の更新に失敗しました')
    }
    
    return response.data
  }

  // 物件削除
  async deleteProperty(id: string): Promise<void> {
    const response = await apiClient.delete(`/properties/${id}`)
    
    if (!response.success) {
      throw new Error('物件の削除に失敗しました')
    }
  }

  // 物件検索（詳細検索）
  async searchProperties(searchParams: {
    keyword?: string
    propertyTypes?: string[]
    priceMin?: number
    priceMax?: number
    area?: string
    page?: number
    limit?: number
  }): Promise<PropertyListResponse> {
    const queryParams = new URLSearchParams()
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)))
        } else {
          queryParams.append(key, String(value))
        }
      }
    })
    
    const response = await apiClient.get<PropertyListResponse>(`/properties?${queryParams.toString()}`)
    
    if (!response.success || !response.data) {
      throw new Error('物件検索に失敗しました')
    }
    
    return response.data
  }

  // 物件画像アップロード
  async uploadPropertyImage(propertyId: string, file: File): Promise<{ url: string }> {
    const response = await apiClient.upload<{ url: string }>(`/properties/${propertyId}/images`, file)
    
    if (!response.success || !response.data) {
      throw new Error('画像のアップロードに失敗しました')
    }
    
    return response.data
  }

  // 物件画像削除
  async deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
    const response = await apiClient.delete(`/properties/${propertyId}/images/${imageId}`)
    
    if (!response.success) {
      throw new Error('画像の削除に失敗しました')
    }
  }

  // CSV一括インポート
  async importFromCSV(file: File): Promise<{ 
    total: number
    success: number
    failed: number
    errors: Array<{ row: number, message: string }>
  }> {
    const response = await apiClient.upload<{
      total: number
      success: number
      failed: number
      errors: Array<{ row: number, message: string }>
    }>('/properties/import', file, {
      type: 'csv'
    })
    
    if (!response.success || !response.data) {
      throw new Error('CSVインポートに失敗しました')
    }
    
    return response.data ?? {
      total: 0,
      success: 0,
      failed: 0,
      errors: []
    }
  }

  // CSV一括エクスポート
  async exportToCSV(params?: PropertyListParams): Promise<Blob> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })
    }
    
    const url = queryParams.toString() ? `/properties/export?${queryParams.toString()}` : '/properties/export'
    
    // Blob レスポンス用の特別な処理
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${apiClient.get}`, // TODO: トークン取得方法を修正
      }
    })
    
    if (!response.ok) {
      throw new Error('CSVエクスポートに失敗しました')
    }
    
    return response.blob()
  }
}

// シングルトンインスタンス
export const propertyService = new PropertyService()