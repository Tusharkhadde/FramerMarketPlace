import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Textarea Component
 * 
 * A multi-line text input field with dynamic height adjustment.
 * 
 * Features:
 * - Dynamic height that grows with content
 * - Smooth focus states
 * - Error state indication
 * - Disabled state support
 * - Dark mode optimized
 * - Accessibility-first design
 * 
 * @component
 * @param {string} [placeholder] - Placeholder text
 * @param {boolean} [disabled] - Disabled state
 * @param {string} [className] - Additional CSS classes
 * @param {string} [aria-invalid] - For validation state
 * @param {string} [aria-describedby] - For error message association
 * 
 * @example
 * ```jsx
 * // Basic textarea
 * <Textarea placeholder="Enter your message" />
 * 
 * // With error state
 * <Textarea aria-invalid="true" className="border-destructive" />
 * 
 * // Disabled textarea
 * <Textarea disabled placeholder="Can't edit this" />
 * ```
 */
function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-all duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:shadow-sm disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:shadow-none md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 resize-none",
        className
      )}
      aria-invalid={props['aria-invalid'] || 'false'}
      {...props} />
  );
}

Textarea.displayName = "Textarea"

export { Textarea }
