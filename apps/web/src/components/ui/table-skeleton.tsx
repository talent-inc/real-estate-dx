import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* ヘッダー */}
      <div className="flex gap-[var(--space-md)] p-[var(--space-md)] border-b border-[var(--border)]">
        {[...Array(columns)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-[var(--text-sm)] flex-1"
          />
        ))}
      </div>

      {/* ボディ */}
      <div className="divide-y divide-[var(--border)]">
        {[...Array(rows)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-[var(--space-md)] p-[var(--space-md)]"
          >
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-[var(--text-base)] flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}