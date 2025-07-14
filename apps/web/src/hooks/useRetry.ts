import { useState, useCallback, useRef } from 'react'
import { useToast } from './useToast'

interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  onRetry?: (attempt: number) => void
  onSuccess?: () => void
  onError?: (error: any, finalAttempt: boolean) => void
}

export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry,
    onSuccess,
    onError,
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<T | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { showError } = useToast()

  const execute = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setRetryCount(0)

    // 前のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    let attempt = 0
    let lastError: any = null

    while (attempt <= maxRetries) {
      try {
        // リトライ時の遅延
        if (attempt > 0) {
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt - 1)
            : retryDelay
          
          await new Promise(resolve => setTimeout(resolve, delay))
          
          // リトライコールバック
          if (onRetry) {
            onRetry(attempt)
          }
          setRetryCount(attempt)
        }

        // 関数の実行
        const result = await fn()
        
        // 成功
        setData(result)
        setIsLoading(false)
        if (onSuccess) {
          onSuccess()
        }
        return result

      } catch (err: any) {
        lastError = err
        
        // キャンセルされた場合は終了
        if (err.name === 'AbortError') {
          setIsLoading(false)
          return
        }

        // 最後の試行の場合
        if (attempt === maxRetries) {
          setError(lastError)
          setIsLoading(false)
          
          if (onError) {
            onError(lastError, true)
          } else {
            showError(`エラーが発生しました。${maxRetries}回の再試行後も解決しませんでした。`)
          }
          
          throw lastError
        }

        // 次の試行へ
        attempt++
      }
    }
  }, [fn, maxRetries, retryDelay, exponentialBackoff, onRetry, onSuccess, onError, showError])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
    setRetryCount(0)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  return {
    execute,
    reset,
    cancel,
    isLoading,
    error,
    data,
    retryCount,
  }
}