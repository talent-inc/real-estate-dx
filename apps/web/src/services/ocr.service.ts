import { apiClient } from '@/lib/api-client'
import { 
  OCRProcessRequest, 
  OCRProcessResponse, 
  OCRJobStatus, 
  DocumentType 
} from '@/types/ocr'
import { ApiResponse } from '@/types/api'

export class OCRService {
  // OCR処理開始
  async processDocument(file: File, documentType: DocumentType): Promise<OCRProcessResponse> {
    const response = await apiClient.upload<OCRProcessResponse['data']>('/ocr/process', file, {
      documentType,
      tenantId: 'current', // 現在のテナントIDを使用
      userId: 'current' // 現在のユーザーIDを使用
    })
    
    if (!response.success || !response.data) {
      throw new Error('OCR処理の開始に失敗しました')
    }
    
    return {
      success: true,
      data: response.data
    }
  }

  // OCR処理状況確認
  async getJobStatus(jobId: string): Promise<OCRJobStatus> {
    const response = await apiClient.get<OCRJobStatus>(`/ocr/status/${jobId}`)
    
    if (!response.success || !response.data) {
      throw new Error('OCR処理状況の取得に失敗しました')
    }
    
    return response.data
  }

  // OCR処理結果取得
  async getJobResult(jobId: string): Promise<OCRProcessResponse> {
    const response = await apiClient.get<OCRProcessResponse['data']>(`/ocr/result/${jobId}`)
    
    if (!response.success || !response.data) {
      throw new Error('OCR処理結果の取得に失敗しました')
    }
    
    return {
      success: true,
      data: response.data
    }
  }

  // OCR結果を物件として保存
  async saveAsProperty(jobId: string, propertyData: {
    title: string
    description?: string
    price?: number
    area?: number
    address?: string
  }): Promise<void> {
    const response = await apiClient.post(`/ocr/${jobId}/save-property`, propertyData)
    
    if (!response.success) {
      throw new Error('OCR結果の物件保存に失敗しました')
    }
  }

  // OCR処理履歴取得
  async getProcessingHistory(params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    jobs: OCRJobStatus[]
    total: number
    page: number
    limit: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    
    const url = queryParams.toString() ? `/ocr/history?${queryParams.toString()}` : '/ocr/history'
    const response = await apiClient.get(url)
    
    if (!response.success || !response.data) {
      throw new Error('OCR処理履歴の取得に失敗しました')
    }
    
    return response.data ?? {
      jobs: [],
      total: 0,
      page: 1,
      limit: 10
    }
  }

  // OCR処理の削除
  async deleteJob(jobId: string): Promise<void> {
    const response = await apiClient.delete(`/ocr/${jobId}`)
    
    if (!response.success) {
      throw new Error('OCR処理の削除に失敗しました')
    }
  }

  // OCR処理の再実行
  async retryJob(jobId: string): Promise<OCRProcessResponse> {
    const response = await apiClient.post<OCRProcessResponse['data']>(`/ocr/${jobId}/retry`)
    
    if (!response.success || !response.data) {
      throw new Error('OCR処理の再実行に失敗しました')
    }
    
    return {
      success: true,
      data: response.data
    }
  }

  // 複数ファイル一括処理
  async processBatchDocuments(files: File[], documentType: DocumentType): Promise<{
    jobs: Array<{ file: string, jobId: string }>
    errors: Array<{ file: string, error: string }>
  }> {
    const results = {
      jobs: [] as Array<{ file: string, jobId: string }>,
      errors: [] as Array<{ file: string, error: string }>
    }
    
    for (const file of files) {
      try {
        const response = await this.processDocument(file, documentType)
        results.jobs.push({
          file: file.name,
          jobId: response.data.documentInfo.filename // TODO: 適切なjobIdを取得
        })
      } catch (error) {
        results.errors.push({
          file: file.name,
          error: error instanceof Error ? error.message : '不明なエラー'
        })
      }
    }
    
    return results
  }

  // OCR設定取得
  async getOCRSettings(): Promise<{
    supportedFormats: string[]
    maxFileSize: number
    maxPages: number
    confidenceThreshold: number
  }> {
    const response = await apiClient.get('/ocr/settings')
    
    if (!response.success || !response.data) {
      throw new Error('OCR設定の取得に失敗しました')
    }
    
    return response.data ?? {
      supportedFormats: ['pdf'],
      maxFileSize: 10485760,
      maxPages: 50,
      confidenceThreshold: 0.8
    }
  }

  // OCR統計情報取得
  async getOCRStats(): Promise<{
    totalProcessed: number
    successfulProcessed: number
    failedProcessed: number
    averageProcessingTime: number
    monthlyUsage: number
    remainingQuota: number
  }> {
    const response = await apiClient.get('/ocr/stats')
    
    if (!response.success || !response.data) {
      throw new Error('OCR統計情報の取得に失敗しました')
    }
    
    return response.data ?? {
      totalProcessed: 0,
      successfulProcessed: 0,
      failedProcessed: 0,
      averageProcessingTime: 0,
      monthlyUsage: 0,
      remainingQuota: 100
    }
  }
}

// シングルトンインスタンス
export const ocrService = new OCRService()