'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログを送信（将来的にSentryなどと連携）
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-[var(--space-lg)] bg-[var(--surface-secondary)]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-[var(--space-md)] w-[64px] h-[64px] rounded-full bg-[var(--critical)]/10 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-8 h-8 text-[var(--critical)]" />
          </div>
          <CardTitle className="text-[var(--text-xl)]">エラーが発生しました</CardTitle>
          <CardDescription className="text-[var(--text-sm)] text-[var(--ink-secondary)]">
            申し訳ございません。予期しないエラーが発生しました。
            <br />
            問題が解決しない場合は、サポートまでお問い合わせください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-[var(--space-md)]">
          {/* エラー詳細（開発環境のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-[var(--space-md)] bg-[var(--surface-elevated)] rounded-[10px] text-[var(--text-xs)] font-mono overflow-auto max-h-[200px]">
              <p className="font-[var(--semibold)] text-[var(--critical)] mb-[var(--space-xs)]">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-[var(--ink-tertiary)]">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          
          {/* エラーコード（本番環境） */}
          {process.env.NODE_ENV === 'production' && error.digest && (
            <div className="text-center p-[var(--space-md)] bg-[var(--surface-elevated)] rounded-[10px]">
              <p className="text-[var(--text-xs)] text-[var(--ink-tertiary)]">
                エラーコード: {error.digest}
              </p>
            </div>
          )}
          
          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-[var(--space-sm)]">
            <Button
              onClick={reset}
              className="flex-1"
              variant="primary"
            >
              <RefreshCw className="w-4 h-4 mr-[var(--space-xs)]" />
              再試行
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
              variant="secondary"
            >
              <Home className="w-4 h-4 mr-[var(--space-xs)]" />
              ホームへ戻る
            </Button>
          </div>
          
          {/* サポート情報 */}
          <div className="text-center pt-[var(--space-md)] border-t border-[var(--border)]">
            <p className="text-[var(--text-xs)] text-[var(--ink-tertiary)]">
              お困りの場合は
              <a
                href="mailto:support@real-estate-dx.com"
                className="text-[var(--tint)] hover:underline ml-[var(--space-xs)]"
              >
                サポートチーム
              </a>
              までご連絡ください
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}