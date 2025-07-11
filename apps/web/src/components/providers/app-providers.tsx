'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useToast, UseToastReturn } from '@/hooks/useToast'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useGlobalLoading, UseLoadingReturn } from '@/hooks/useLoading'

// Toast Provider Context
const ToastContext = createContext<UseToastReturn | undefined>(undefined)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}

// Loading Provider Context
const LoadingContext = createContext<UseLoadingReturn | undefined>(undefined)

export function useLoadingContext() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoadingContext must be used within LoadingProvider')
  }
  return context
}

// Error Handler Provider Context
const ErrorHandlerContext = createContext<ReturnType<typeof useErrorHandler> | undefined>(undefined)

export function useErrorHandlerContext() {
  const context = useContext(ErrorHandlerContext)
  if (!context) {
    throw new Error('useErrorHandlerContext must be used within ErrorHandlerProvider')
  }
  return context
}

// Toast Component
function ToastContainer() {
  const { toasts, removeToast } = useToastContext()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-72 max-w-md p-4 rounded-lg shadow-lg backdrop-blur-sm 
            transform transition-all duration-300 ease-in-out
            ${toast.type === 'success' && 'bg-green-500 text-white'}
            ${toast.type === 'error' && 'bg-red-500 text-white'}
            ${toast.type === 'warning' && 'bg-yellow-500 text-white'}
            ${toast.type === 'info' && 'bg-blue-500 text-white'}
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {toast.title && (
                <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
              )}
              <p className="text-sm">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Global Loading Overlay
function GlobalLoadingOverlay() {
  const { isLoading } = useLoadingContext()

  if (!isLoading('app')) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="text-gray-700">読み込み中...</span>
      </div>
    </div>
  )
}

// Main App Providers Component
interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const toast = useToast()
  const loading = useGlobalLoading()
  const errorHandler = useErrorHandler()

  return (
    <ToastContext.Provider value={toast}>
      <LoadingContext.Provider value={loading}>
        <ErrorHandlerContext.Provider value={errorHandler}>
          {children}
          <ToastContainer />
          <GlobalLoadingOverlay />
        </ErrorHandlerContext.Provider>
      </LoadingContext.Provider>
    </ToastContext.Provider>
  )
}

// 便利なフック: API呼び出し用の統合フック
export function useApiCall() {
  const { withLoading } = useLoadingContext()
  const { withErrorHandling } = useErrorHandlerContext()

  const apiCall = React.useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    options?: {
      loadingKey?: string
      showErrorToast?: boolean
      fallbackMessage?: string
    }
  ) => {
    const { loadingKey = 'api', showErrorToast = true, fallbackMessage } = options || {}

    return withLoading(
      loadingKey,
      withErrorHandling(asyncFn, {
        showToast: showErrorToast,
        fallbackMessage,
      })
    )
  }, [withLoading, withErrorHandling])

  return { apiCall }
}