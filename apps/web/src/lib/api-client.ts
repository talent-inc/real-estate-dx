import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { ApiResponse, ApiError, ApiHeaders } from '@/types/api'

export class ApiClient {
  private client: AxiosInstance
  private tenantId?: string
  private getAccessToken?: () => string | null

  constructor(options?: {
    baseURL?: string
    tenantId?: string
    getAccessToken?: () => string | null
  }) {
    const baseURL = options?.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.tenantId = options?.tenantId
    this.getAccessToken = options?.getAccessToken

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // リクエストインターセプター: JWT認証とヘッダー設定
    this.client.interceptors.request.use(
      (config) => {
        // リクエストIDを生成
        const requestId = uuidv4()
        config.headers['X-Request-ID'] = requestId

        // JWT トークンを追加
        const token = this.getAccessToken?.()
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }

        // テナントIDを追加
        if (this.tenantId) {
          config.headers['X-Tenant-ID'] = this.tenantId
        }

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          requestId,
          headers: config.headers,
        })

        return config
      },
      (error) => {
        console.error('[API Request Error]', error)
        return Promise.reject(error)
      }
    )

    // レスポンスインターセプター: エラーハンドリング
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`, {
          data: response.data,
        })
        return response
      },
      async (error: AxiosError) => {
        const requestId = error.config?.headers?.['X-Request-ID']
        
        console.error(`[API Error] ${error.response?.status} ${error.config?.url}`, {
          requestId,
          error: error.response?.data,
        })

        // 401エラー時の処理（認証切れ）
        if (error.response?.status === 401) {
          // TODO: 認証ストアからログアウト処理を呼び出す
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }

        // 429エラー時の処理（レート制限）
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after']
          console.warn(`[Rate Limited] Retry after ${retryAfter} seconds`)
        }

        return Promise.reject(error)
      }
    )
  }

  // テナントIDとアクセストークン取得関数を設定
  setTenantId(tenantId: string) {
    this.tenantId = tenantId
  }

  setTokenProvider(getAccessToken: () => string | null) {
    this.getAccessToken = getAccessToken
  }

  // 基本的なHTTPメソッド
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  // ファイルアップロード用
  async upload<T>(url: string, file: File, data?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  // ヘルスチェック
  async healthCheck() {
    return this.get('/health')
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient()

// エラーハンドリングユーティリティ
export function isApiError(error: any): error is AxiosError<ApiResponse<never>> {
  return error?.isAxiosError && error?.response?.data?.error
}

export function getApiErrorMessage(error: any): string {
  if (isApiError(error)) {
    return error.response?.data?.error?.message || 'APIエラーが発生しました'
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '不明なエラーが発生しました'
}

export function getApiErrorCode(error: any): string | undefined {
  if (isApiError(error)) {
    return error.response?.data?.error?.code
  }
  return undefined
}