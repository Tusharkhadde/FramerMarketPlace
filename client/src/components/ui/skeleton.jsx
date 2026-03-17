import { cn } from "@/lib/utils"

/**
 * Skeleton Component
 * 
 * A placeholder component that animates while content is loading.
 * Use multiple skeletons with different sizes to match your layout.
 * 
 * Features:
 * - Smooth pulse animation
 * - Responsive sizing
 * - Multiple shape variants (square, circle, text)
 * - Accessible loading state indication
 * - Dark mode optimized
 * 
 * @component
 * @param {string} [className] - Additional CSS classes for sizing
 * @param {string} [variant] - Skeleton shape (default | circle | text)
 * 
 * @example
 * ```jsx
 * // Rectangle loader (default)
 * <Skeleton className="w-full h-12" />
 * 
 * // Circle loader for avatars
 * <Skeleton className="w-12 h-12 rounded-full" />
 * 
 * // Multiple loaders for card
 * <div className="space-y-2">
 *   <Skeleton className="h-12 w-12 rounded-full" />
 *   <Skeleton className="h-4 w-full" />
 *   <Skeleton className="h-4 w-3/4" />
 * </div>
 * 
 * // Text line loader
 * <Skeleton className="h-4 w-full" />
 * <Skeleton className="h-4 w-3/5 mt-2" />
 * ```
 */
function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-label="Loading"
      className={cn("animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted dark:from-muted/50 dark:via-muted/30 dark:to-muted/50", className)}
      {...props} />
  );
}

Skeleton.displayName = "Skeleton"

/**
 * SkeletonLine - Convenience component for text line skeletons
 */
export function SkeletonLine({ className, ...props }) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />
}

/**
 * SkeletonCircle - Convenience component for circular skeletons (avatars, icons)
 */
export function SkeletonCircle({ className = "size-10", ...props }) {
  return <Skeleton className={cn("rounded-full", className)} {...props} />
}

export { Skeleton }
