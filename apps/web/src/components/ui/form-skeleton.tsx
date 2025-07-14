import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FormSkeletonProps {
  fields?: number
  showFooter?: boolean
}

export function FormSkeleton({ fields = 4, showFooter = true }: FormSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-[var(--text-xl)] w-48 mb-[var(--space-xs)]" />
        <Skeleton className="h-[var(--text-sm)] w-64" />
      </CardHeader>
      <CardContent className="space-y-[var(--space-lg)]">
        {[...Array(fields)].map((_, i) => (
          <div key={i} className="space-y-[var(--space-xs)]">
            <Skeleton className="h-[var(--text-sm)] w-24" />
            <Skeleton className="h-[44px] w-full rounded-[10px]" />
          </div>
        ))}
      </CardContent>
      {showFooter && (
        <CardFooter className="flex gap-[var(--space-sm)]">
          <Skeleton className="h-[44px] w-32 rounded-[22px]" />
          <Skeleton className="h-[44px] w-32 rounded-[22px]" />
        </CardFooter>
      )}
    </Card>
  )
}