import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-[var(--space-lg)] bg-[var(--surface-secondary)]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-[var(--space-md)] w-[64px] h-[64px] rounded-full bg-[var(--surface-elevated)] flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-[var(--ink-secondary)]" />
          </div>
          <CardTitle className="text-[var(--text-xl)]">ページが見つかりません</CardTitle>
          <CardDescription className="text-[var(--text-sm)] text-[var(--ink-secondary)]">
            お探しのページは存在しないか、移動した可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-[var(--space-md)]">
          {/* エラーコード */}
          <div className="text-center">
            <p className="text-[72px] font-[var(--semibold)] text-[var(--ink-tertiary)] leading-none">
              404
            </p>
          </div>
          
          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-[var(--space-sm)]">
            <Button asChild className="flex-1" variant="primary">
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-[var(--space-xs)]" />
                ホームへ戻る
              </Link>
            </Button>
            <Button asChild className="flex-1" variant="secondary">
              <Link href="/properties">
                <Search className="w-4 h-4 mr-[var(--space-xs)]" />
                物件を探す
              </Link>
            </Button>
          </div>
          
          {/* ヘルプリンク */}
          <div className="text-center pt-[var(--space-md)] border-t border-[var(--border)]">
            <p className="text-[var(--text-xs)] text-[var(--ink-tertiary)]">
              よくアクセスされるページ：
            </p>
            <div className="flex flex-wrap justify-center gap-[var(--space-sm)] mt-[var(--space-sm)]">
              <Link
                href="/dashboard"
                className="text-[var(--text-xs)] text-[var(--tint)] hover:underline"
              >
                ダッシュボード
              </Link>
              <span className="text-[var(--ink-tertiary)]">•</span>
              <Link
                href="/properties"
                className="text-[var(--text-xs)] text-[var(--tint)] hover:underline"
              >
                物件管理
              </Link>
              <span className="text-[var(--ink-tertiary)]">•</span>
              <Link
                href="/ocr"
                className="text-[var(--text-xs)] text-[var(--tint)] hover:underline"
              >
                OCR処理
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}