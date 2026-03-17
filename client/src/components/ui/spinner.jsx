import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

/**
 * Spinner Component
 * 
 * A loading indicator component showing animated rotation.
 * Useful for async operations and data fetching states.
 * 
 * Features:
 * - Accessible with role="status" and aria-label
 * - Fully customizable size via className
 * - Smooth spinning animation
 * - Works well with loading messages
 * 
 * @component
 * @param {string} [className] - Additional CSS classes (e.g., 'size-8' for larger spinner)
 * @param {string} [aria-label='Loading'] - Accessibility label
 * 
 * @example
 * ```jsx
 * // Basic spinner
 * <Spinner />
 * 
 * // Larger spinner
 * <Spinner className="size-8" />
 * 
 * // With text
 * <div className="flex items-center gap-2">
 *   <Spinner />
 *   <span>Loading...</span>
 * </div>
 * ```
 */
function Spinner({
  className,
  ...props
}) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin text-primary", className)}
      aria-hidden="false"
      {...props} />
  );
}

Spinner.displayName = "Spinner"

export { Spinner }
