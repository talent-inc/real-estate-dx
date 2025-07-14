import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* 画像部分 */}
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      
      {/* コンテンツ部分 */}
      <CardContent className="p-[var(--space-lg)]">
        {/* タイトル */}
        <Skeleton className="h-[var(--text-lg)] w-3/4 mb-[var(--space-xs)]" />
        
        {/* 価格 */}
        <Skeleton className="h-[var(--text-xl)] w-1/2 mb-[var(--space-sm)]" />
        
        {/* 詳細情報 */}
        <div className="space-y-[var(--space-xs)]">
          <Skeleton className="h-[var(--text-sm)] w-full" />
          <Skeleton className="h-[var(--text-sm)] w-5/6" />
        </div>
      </CardContent>
    </Card>
  )
}