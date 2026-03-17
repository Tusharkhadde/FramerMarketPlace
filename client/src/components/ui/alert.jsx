import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * Alert variants configuration
 * 
 * Variants:
 * - default: Normal informational alert
 * - destructive: Error/warning state alert
 * - success: Success state alert
 * - info: Informational alert
 * - warning: Warning alert
 * 
 * Features:
 * - Semantic role="alert" for accessibility
 * - Icon support with auto-alignment
 * - Responsive grid layout
 * - Dark mode optimized colors
 * - Smooth transitions
 */
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-foreground/10 shadow-sm",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/30 *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-destructive dark:bg-destructive/20 dark:border-destructive/40",
        success:
          "bg-green-50 text-green-900 border-green-200 *:[svg]:text-green-600 dark:bg-green-950 dark:text-green-100 dark:border-green-800 dark:*:[svg]:text-green-400",
        info:
          "bg-blue-50 text-blue-900 border-blue-200 *:[svg]:text-blue-600 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800 dark:*:[svg]:text-blue-400",
        warning:
          "bg-yellow-50 text-yellow-900 border-yellow-200 *:[svg]:text-yellow-600 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800 dark:*:[svg]:text-yellow-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Alert Component
 * 
 * A notification box that displays important information to users.
 * 
 * @component
 * @param {string} [variant='default'] - Alert style variant
 * @param {React.ReactNode} [children] - Alert content
 * 
 * @example
 * ```jsx
 * <Alert>
 *   <AlertIcon />
 *   <AlertTitle>Alert Title</AlertTitle>
 *   <AlertDescription>Alert description text</AlertDescription>
 * </Alert>
 * 
 * <Alert variant="destructive">
 *   <AlertTriangleIcon />
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>Something went wrong</AlertDescription>
 * </Alert>
 * ```
 */
function Alert({
  className,
  variant,
  ...props
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(alertVariants({ variant }), className)}
      {...props} />
  );
}

/**
 * AlertTitle - Title element for the alert
 */
function AlertTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props} />
  );
}

/**
 * AlertDescription - Description/content of the alert
 */
function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props} />
  );
      )}
      {...props} />
  );
}

function AlertAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
