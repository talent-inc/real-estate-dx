import { v4 as uuidv4 } from 'uuid'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
    requestId: string
    timestamp: string
  }
}

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const requestId = uuidv4()
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
  }

  // 認証トークンがあれば追加（後で実装）
  // const token = getAuthToken()
  // if (token) {
  //   defaultHeaders['Authorization'] = `Bearer ${token}`
  // }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unknown error occurred',
        data.error?.details,
        data.error?.requestId || requestId
      )
    }

    if (!data.success) {
      throw new ApiError(
        data.error?.code || 'API_ERROR',
        data.error?.message || 'API request failed',
        data.error?.details,
        data.error?.requestId || requestId
      )
    }

    return data.data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // ネットワークエラーやその他のエラー
    throw new ApiError(
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network request failed',
      undefined,
      requestId
    )
  }
}

// API関数群
export const api = {
  // ヘルスチェック
  health: () => apiRequest<{ status: string; timestamp: string; message: string }>('/health'),

  // 認証関連
  auth: {
    login: (email: string, password: string) =>
      apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    register: (userData: {
      email: string
      password: string
      companyName: string
      fullName: string
    }) =>
      apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    logout: () =>
      apiRequest('/auth/logout', {
        method: 'POST',
      }),
    
    forgotPassword: (email: string) =>
      apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  // 物件管理関連
  properties: {
    list: (params?: Record<string, any>) => {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
      }
      const query = searchParams.toString()
      return apiRequest<any[]>(`/properties${query ? `?${query}` : ''}`)
    },
    
    get: (id: string) =>
      apiRequest<any>(`/properties/${id}`),
    
    create: (propertyData: any) =>
      apiRequest<any>('/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      }),
    
    update: (id: string, propertyData: any) =>
      apiRequest<any>(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(propertyData),
      }),
    
    delete: (id: string) =>
      apiRequest(`/properties/${id}`, {
        method: 'DELETE',
      }),
  },

  // AI-OCR関連
  ocr: {
    upload: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      return apiRequest<{ taskId: string }>('/ocr/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Content-Typeを設定しない（FormDataの場合、ブラウザが自動設定）
          'X-Request-ID': uuidv4(),
        },
      })
    },
    
    getTasks: () =>
      apiRequest<any[]>('/ocr/tasks'),
    
    getTask: (id: string) =>
      apiRequest<any>(`/ocr/tasks/${id}`),
    
    confirmTask: (id: string, confirmedData: any) =>
      apiRequest<any>(`/ocr/tasks/${id}/confirm`, {
        method: 'POST',
        body: JSON.stringify(confirmedData),
      }),
    
    deleteTask: (id: string) =>
      apiRequest(`/ocr/tasks/${id}`, {
        method: 'DELETE',
      }),
  },
}

export { ApiError }
export type { ApiResponse }