import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-[var(--space-md)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-[var(--text-sm)] w-24 mb-[var(--space-xs)]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[var(--text-xxl)] w-32 mb-[var(--space-xs)]" />
            <Skeleton className="h-[var(--text-xs)] w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-[var(--text-lg)] w-48 mb-[var(--space-xs)]" />
        <Skeleton className="h-[var(--text-sm)] w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-[10px]" />
      </CardContent>
    </Card>
  )
}

export function DashboardActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-[var(--text-lg)] w-32" />
      </CardHeader>
      <CardContent className="space-y-[var(--space-md)]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-[var(--space-md)]">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-[var(--text-base)] w-full mb-[var(--space-xs)]" />
              <Skeleton className="h-[var(--text-sm)] w-3/4" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-[var(--space-lg)]">
      {/* ヘッダー */}
      <div>
        <Skeleton className="h-[var(--text-xxl)] w-48 mb-[var(--space-xs)]" />
        <Skeleton className="h-[var(--text-base)] w-64" />
      </div>

      {/* 統計カード */}
      <DashboardStatsSkeleton />

      {/* チャートとアクティビティ */}
      <div className="grid gap-[var(--space-lg)] lg:grid-cols-2">
        <DashboardChartSkeleton />
        <DashboardActivitySkeleton />
      </div>
    </div>
  )
}