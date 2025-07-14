import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[6px] bg-[var(--surface-elevated)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }