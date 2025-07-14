/**
 * 認証関連のAPI契約定義
 * フロントエンド（AI-1）とバックエンド（AI-2）の間で共有される型定義
 */

// ========== ユーザー関連 ==========
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// ========== ログイン ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  data?: {
    token: string;
    refreshToken: string;
    user: UserDto;
    expiresIn: number; // seconds
  };
  message?: string;
  code?: string; // エラーコード
}

// ========== サインアップ ==========
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface SignupResponse {
  status: 'success' | 'error';
  data?: {
    user: UserDto;
    message: string; // "確認メールを送信しました"
  };
  message?: string;
  code?: string;
}

// ========== パスワードリセット ==========
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  status: 'success' | 'error';
  data?: {
    message: string; // "リセットメールを送信しました"
  };
  message?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  status: 'success' | 'error';
  data?: {
    message: string; // "パスワードを更新しました"
  };
  message?: string;
}

// ========== トークンリフレッシュ ==========
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  status: 'success' | 'error';
  data?: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
  message?: string;
}

// ========== 認証ヘッダー ==========
export interface AuthHeaders {
  Authorization: `Bearer ${string}`;
}

// ========== エラーコード定義 ==========
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH001',
  EMAIL_ALREADY_EXISTS = 'AUTH002',
  INVALID_TOKEN = 'AUTH003',
  TOKEN_EXPIRED = 'AUTH004',
  USER_NOT_FOUND = 'AUTH005',
  ACCOUNT_DISABLED = 'AUTH006',
}

// ========== エンドポイント定義 ==========
export const AUTH_ENDPOINTS = {
  login: 'POST /api/v1/auth/login',
  signup: 'POST /api/v1/auth/signup',
  logout: 'POST /api/v1/auth/logout',
  forgotPassword: 'POST /api/v1/auth/forgot-password',
  resetPassword: 'POST /api/v1/auth/reset-password',
  refreshToken: 'POST /api/v1/auth/refresh',
  me: 'GET /api/v1/auth/me',
} as const;