import { useState, useEffect } from 'react'
import { useToast } from './useToast'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )
  const { showWarning, showSuccess } = useToast()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      showSuccess('インターネット接続が復旧しました')
    }

    const handleOffline = () => {
      setIsOnline(false)
      showWarning('インターネット接続が失われました。一部機能が制限される可能性があります。')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [showWarning, showSuccess])

  return isOnline
}