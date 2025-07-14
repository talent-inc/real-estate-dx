import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[44px] w-full rounded-[10px] border border-transparent bg-[var(--surface-elevated)] px-[16px] text-[var(--text-base)] text-[var(--ink)] transition-all duration-[var(--duration-fast)] placeholder:text-[var(--ink-tertiary)] hover:bg-[var(--surface-secondary)] focus:bg-[var(--surface)] focus:border-[var(--tint)] focus:outline-none focus:ring-2 focus:ring-[var(--tint)]/10 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }