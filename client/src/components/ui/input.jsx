import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component
 * 
 * A flexible, accessible text input component with multiple input types.
 * 
 * Features:
 * - Full keyboard navigation support
 * - Error state indication with visual feedback
 * - Disabled state with proper styling
 * - File input support with custom styling
 * - Dark mode optimized
 * - Accessibility-first design with ARIA attributes
 * 
 * @component
 * @param {Object} props
 * @param {string} [props.type='text'] - Input type (text, email, password, number, file, etc.)
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.aria-invalid] - For validation state
 * @param {string} [props.aria-describedby] - For error message association
 * @param {string} [props.aria-label] - Accessibility label
 * 
 * @example
 * ```jsx
 * // Basic input
 * <Input placeholder="Enter text" />
 * 
 * // Email input
 * <Input type="email" placeholder="your@email.com" />
 * 
 * // With error state
 * <Input aria-invalid="true" />
 * 
 * // Disabled input
 * <Input disabled placeholder="Can't edit this" />
 * 
 * // File input
 * <Input type="file" />
 * ```
 */
const Input = React.forwardRef(({
  className,
  type,
  ...props
}, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      data-slot="input"
      data-input-type={type}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:shadow-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:shadow-none md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 transition-shadow duration-200",
        className
      )}
      aria-invalid={props['aria-invalid'] || 'false'}
      {...props} />
  );
})

Input.displayName = "Input"

export { Input }
