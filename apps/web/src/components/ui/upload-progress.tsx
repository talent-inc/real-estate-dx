import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Upload, X } from 'lucide-react'

interface UploadProgressProps {
  fileName: string
  fileSize: number
  progress: number
  status: 'uploading' | 'success' | 'error'
  onCancel?: () => void
  onRetry?: () => void
  error?: string
}

export function UploadProgress({
  fileName,
  fileSize,
  progress,
  status,
  onCancel,
  onRetry,
  error,
}: UploadProgressProps) {
  const [isVisible, setIsVisible] = useState(true)

  // 成功時は3秒後に自動的に非表示
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status])

  if (!isVisible && status === 'success') {
    return null
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 text-[var(--tint)]" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-[var(--positive)]" />
      case 'error':
        return <XCircle className="h-4 w-4 text-[var(--critical)]" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `アップロード中... ${progress}%`
      case 'success':
        return 'アップロード完了'
      case 'error':
        return error || 'アップロードエラー'
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-[var(--space-md)]">
        <div className="flex items-start gap-[var(--space-md)]">
          {/* アイコン */}
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon()}
          </div>

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-[var(--space-sm)]">
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-sm)] font-[var(--medium)] text-[var(--ink)] truncate">
                  {fileName}
                </p>
                <p className="text-[var(--text-xs)] text-[var(--ink-secondary)]">
                  {formatFileSize(fileSize)} • {getStatusText()}
                </p>
              </div>

              {/* アクションボタン */}
              {status === 'uploading' && onCancel && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {status === 'error' && onRetry && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRetry}
                >
                  再試行
                </Button>
              )}
            </div>

            {/* プログレスバー */}
            {status === 'uploading' && (
              <div className="mt-[var(--space-sm)]">
                <Progress value={progress} className="h-[4px]" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}