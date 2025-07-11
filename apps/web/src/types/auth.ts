// 認証関連の型定義

export interface LoginRequest {
  email: string
  password: string
  tenantId: string
}

export interface LoginResponse {
  success: true
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    user: User
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string
}

export type UserRole = 'ADMIN' | 'AGENT' | 'VIEWER'

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
}

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
}