import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge variants configuration
 * 
 * Available variants:
 * - default: Primary badge style
 * - secondary: Secondary badge style  
 * - destructive: Red/error badge for warnings
 * - outline: Border-only badge style
 * - success: Green badge for positive states
 * - warning: Yellow badge for warnings
 * - info: Blue badge for informational content
 * - muted: Muted/inactive badge
 * 
 * Features:
 * - Smooth color transitions on hover
 * - Keyboard focus support
 * - Dark mode optimized colors
 * - Fully responsive sizing
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm hover:shadow-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm hover:shadow-md dark:bg-destructive/80 dark:hover:bg-destructive/60",
        outline: "text-foreground border-current hover:bg-muted/50 dark:hover:bg-muted/30",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md dark:bg-green-600 dark:hover:bg-green-700",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm hover:shadow-md dark:bg-yellow-600 dark:hover:bg-yellow-700",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-700",
        muted:
          "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Badge Component
 * 
 * A compact label component for displaying status, categories, or tags.
 * 
 * @component
 * @param {Object} props
 * @param {string} [props.variant='default'] - Badge style variant
 * @param {string} [props.size='default'] - Badge size
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.children] - Badge content
 * 
 * @example
 * ```jsx
 * // Basic badge
 * <Badge>New</Badge>
 * 
 * // With variant
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="destructive">Error</Badge>
 * 
 * // With size
 * <Badge size="lg">Large Badge</Badge>
 * ```
 */
function Badge({ className, variant, size, ...props }) {
  return (
    <span 
      className={cn(badgeVariants({ variant, size }), className)} 
      role="status"
      {...props} />
  )
}

export { Badge, badgeVariants }