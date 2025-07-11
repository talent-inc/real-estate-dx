import { useCallback } from 'react'
import { useToast } from './useToast'
import { getApiErrorMessage, getApiErrorCode, isApiError } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
}

export function useErrorHandler() {
  const { showError } = useToast()
  const logout = useAuthStore(state => state.logout)

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'エラーが発生しました'
    } = options

    let errorMessage = fallbackMessage
    let errorCode: string | undefined

    if (isApiError(error)) {
      errorMessage = getApiErrorMessage(error)
      errorCode = getApiErrorCode(error)

      // 401エラー（認証エラー）の場合は自動ログアウト
      if (error.response?.status === 401) {
        logout()
        errorMessage = 'セッションの有効期限が切れました。再度ログインしてください。'
      }

      // 403エラー（認可エラー）の場合
      if (error.response?.status === 403) {
        errorMessage = 'この操作を実行する権限がありません。'
      }

      // 429エラー（レート制限）の場合
      if (error.response?.status === 429) {
        errorMessage = 'リクエストが多すぎます。しばらく時間をおいてから再試行してください。'
      }

      // 500エラー（サーバーエラー）の場合
      if (error.response?.status === 500) {
        errorMessage = 'サーバーでエラーが発生しました。管理者にお問い合わせください。'
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    // エラーログ出力
    if (logError) {
      console.error('Error handled:', {
        error,
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      })
    }

    // トースト表示
    if (showToast) {
      showError(errorMessage, errorCode ? `エラーコード: ${errorCode}` : undefined)
    }

    return {
      message: errorMessage,
      code: errorCode,
    }
  }, [showError, logout])

  // APIエラー専用のハンドラー
  const handleApiError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    if (isApiError(error)) {
      return handleError(error, options)
    }

    // APIエラーでない場合は一般的なエラーとして処理
    return handleError(
      new Error('不明なAPIエラーが発生しました'),
      options
    )
  }, [handleError])

  // 非同期処理のエラーハンドリング用ラッパー
  const withErrorHandling = useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        return await asyncFn(...args)
      } catch (error) {
        handleError(error, options)
        return undefined
      }
    }
  }, [handleError])

  // バリデーションエラー専用のハンドラー
  const handleValidationError = useCallback((
    validationErrors: Array<{ field: string; message: string }>,
    options: Omit<ErrorHandlerOptions, 'fallbackMessage'> = {}
  ) => {
    const { showToast = true, logError = true } = options

    const errorMessage = validationErrors.length === 1
      ? validationErrors[0].message
      : `入力エラー: ${validationErrors.length}件のエラーがあります`

    if (logError) {
      console.error('Validation errors:', validationErrors)
    }

    if (showToast) {
      showError(errorMessage, '入力エラー')
    }

    return validationErrors
  }, [showError])

  return {
    handleError,
    handleApiError,
    withErrorHandling,
    handleValidationError,
  }
}