import { apiClient } from '@/lib/api-client'
import { LoginRequest, LoginResponse, RefreshTokenRequest, User } from '@/types/auth'
import { ApiResponse } from '@/types/api'

export class AuthService {
  // ログイン
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse['data']>('/auth/login', credentials)
    
    if (!response.success || !response.data) {
      throw new Error('ログインに失敗しました')
    }
    
    return {
      success: true,
      data: response.data
    }
  }

  // ログアウト
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // ログアウトエラーは無視（サーバー側で処理済みの可能性）
      console.warn('Logout request failed:', error)
    }
  }

  // トークンリフレッシュ
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse['data']>('/auth/refresh', {
      refreshToken
    })
    
    if (!response.success || !response.data) {
      throw new Error('トークンの更新に失敗しました')
    }
    
    return {
      success: true,
      data: response.data
    }
  }

  // ユーザー情報取得
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me')
    
    if (!response.success || !response.data) {
      throw new Error('ユーザー情報の取得に失敗しました')
    }
    
    return response.data
  }

  // パスワードリセット要求
  async requestPasswordReset(email: string): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password', { email })
    
    if (!response.success) {
      throw new Error('パスワードリセット要求に失敗しました')
    }
  }

  // パスワードリセット実行
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword
    })
    
    if (!response.success) {
      throw new Error('パスワードのリセットに失敗しました')
    }
  }

  // 新規ユーザー登録
  async register(userData: {
    email: string
    password: string
    name: string
    tenantId: string
  }): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse['data']>('/auth/register', userData)
    
    if (!response.success || !response.data) {
      throw new Error('ユーザー登録に失敗しました')
    }
    
    return {
      success: true,
      data: response.data
    }
  }
}

// シングルトンインスタンス
export const authService = new AuthService()