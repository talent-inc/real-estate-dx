import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[var(--tint)] text-white rounded-[22px] hover:bg-[var(--tint-hover)] hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-[var(--tint)] shadow-sm",
        secondary: "bg-transparent text-[var(--tint)] rounded-[22px] border-[1.5px] border-[var(--border)] hover:bg-[var(--surface-elevated)] focus-visible:ring-[var(--tint)]",
        destructive:
          "bg-[var(--critical)] text-white rounded-[22px] hover:bg-[var(--critical)]/90 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-[var(--critical)] shadow-sm",
        ghost: "text-[var(--ink)] rounded-[10px] hover:bg-[var(--surface-elevated)] focus-visible:ring-[var(--tint)]",
        link: "text-[var(--tint)] underline-offset-4 hover:underline focus-visible:ring-[var(--tint)]",
      },
      size: {
        default: "h-[44px] px-[22px] text-[var(--text-base)] rounded-[22px]",
        sm: "h-[36px] px-[16px] text-[var(--text-sm)] rounded-[18px]",
        lg: "h-[52px] px-[32px] text-[var(--text-lg)] rounded-[26px]",
        icon: "h-[44px] w-[44px] rounded-[22px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }