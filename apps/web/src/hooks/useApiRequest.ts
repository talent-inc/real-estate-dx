import { useState, useCallback } from 'react'
import { useRetry } from './useRetry'
import { useOnlineStatus } from './useOnlineStatus'
import { useToast } from './useToast'
import { ApiError } from '@/types/api'

interface UseApiRequestOptions {
  maxRetries?: number
  retryDelay?: number
  showErrorToast?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: ApiError | Error) => void
}

export function useApiRequest<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiRequestOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showErrorToast = true,
    onSuccess,
    onError,
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [data, setData] = useState<T | null>(null)
  
  const isOnline = useOnlineStatus()
  const { showError, showWarning } = useToast()

  const handleError = useCallback((err: any, isFinalAttempt: boolean) => {
    if (!isFinalAttempt) return

    // ネットワークエラー
    if (!isOnline) {
      showWarning('インターネット接続を確認してください')
      return
    }

    // APIエラー
    if (err.response?.data?.error) {
      const apiError = err.response.data.error as ApiError
      
      if (showErrorToast) {
        switch (apiError.code) {
          case 'AUTHENTICATION_ERROR':
            showError('認証エラー: ログインし直してください')
            break
          case 'AUTHORIZATION_ERROR':
            showError('権限エラー: この操作を実行する権限がありません')
            break
          case 'VALIDATION_ERROR':
            showError('入力エラー: 入力内容を確認してください')
            break
          case 'NOT_FOUND':
            showError('データが見つかりません')
            break
          case 'RATE_LIMIT_EXCEEDED':
            showError('リクエスト制限: しばらく待ってから再試行してください')
            break
          default:
            showError(apiError.message || 'エラーが発生しました')
        }
      }
      
      if (onError) {
        onError(apiError)
      }
    } else {
      // その他のエラー
      if (showErrorToast) {
        showError(err.message || '予期しないエラーが発生しました')
      }
      
      if (onError) {
        onError(err)
      }
    }
  }, [isOnline, showError, showWarning, showErrorToast, onError])

  const { execute: retryExecute, cancel, reset } = useRetry(
    async () => {
      if (!isOnline) {
        throw new Error('オフライン中です')
      }
      return apiFunction()
    },
    {
      maxRetries,
      retryDelay,
      exponentialBackoff: true,
      onRetry: (attempt) => {
        console.log(`Retrying API request (attempt ${attempt}/${maxRetries})`)
      },
      onSuccess: () => {
        if (onSuccess && data) {
          onSuccess(data)
        }
      },
      onError: handleError,
    }
  )

  const execute = useCallback(async (...args: Parameters<typeof apiFunction>) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await retryExecute()
      setData(result)
      setIsLoading(false)
      return result
    } catch (err: any) {
      setError(err)
      setIsLoading(false)
      throw err
    }
  }, [retryExecute])

  return {
    execute,
    cancel,
    reset,
    isLoading,
    error,
    data,
  }
}