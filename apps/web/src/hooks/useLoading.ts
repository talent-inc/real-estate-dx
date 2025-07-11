import { useState, useCallback, useRef } from 'react'

export interface LoadingState {
  [key: string]: boolean
}

export interface UseLoadingReturn {
  loading: LoadingState
  isLoading: (key?: string) => boolean
  setLoading: (key: string, loading: boolean) => void
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  clearAllLoading: () => void
  withLoading: <T extends any[], R>(
    key: string,
    asyncFn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>
}

export function useLoading(initialState: LoadingState = {}): UseLoadingReturn {
  const [loading, setLoadingState] = useState<LoadingState>(initialState)
  const loadingRef = useRef<LoadingState>(initialState)

  // 最新の状態を常に保持
  loadingRef.current = loading

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingRef.current[key] || false
    }
    // キーが指定されていない場合は、いずれかがローディング中かチェック
    return Object.values(loadingRef.current).some(Boolean)
  }, [])

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: loading,
    }))
  }, [])

  const startLoading = useCallback((key: string) => {
    setLoading(key, true)
  }, [setLoading])

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false)
  }, [setLoading])

  const clearAllLoading = useCallback(() => {
    setLoadingState({})
  }, [])

  // 非同期処理をローディング状態で包むヘルパー
  const withLoading = useCallback(<T extends any[], R>(
    key: string,
    asyncFn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      startLoading(key)
      try {
        const result = await asyncFn(...args)
        return result
      } finally {
        stopLoading(key)
      }
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    clearAllLoading,
    withLoading,
  }
}

// グローバルローディング状態用のカスタムフック
export function useGlobalLoading() {
  return useLoading({
    app: false,
    auth: false,
    api: false,
  })
}

// 特定の機能用のローディング状態
export function usePropertyLoading() {
  return useLoading({
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false,
    search: false,
  })
}

export function useOCRLoading() {
  return useLoading({
    upload: false,
    process: false,
    result: false,
    history: false,
  })
}

export function useAuthLoading() {
  return useLoading({
    login: false,
    logout: false,
    register: false,
    refresh: false,
    forgotPassword: false,
    resetPassword: false,
  })
}