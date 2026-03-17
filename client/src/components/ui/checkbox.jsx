import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Checkbox Component
 * 
 * An accessible checkbox input component with visual feedback.
 * 
 * Features:
 * - Three-state support (checked, unchecked, indeterminate)
 * - Full keyboard navigation
 * - Visual focus ring
 * - Disabled state support
 * - Dark mode optimized
 * - Semantic checkbox input behavior
 * 
 * @component
 * @param {boolean} [checked] - Controlled checked state
 * @param {Function} [onCheckedChange] - Checked state change handler
 * @param {boolean} [disabled] - Disabled state
 * @param {string} [className] - Additional CSS classes
 * @param {string} [aria-label] - Accessibility label
 * @param {string} [aria-describedby] - For error/help text association
 * 
 * @example
 * ```jsx
 * // Uncontrolled
 * <Checkbox />
 * 
 * // Controlled
 * const [checked, setChecked] = useState(false)
 * <Checkbox checked={checked} onCheckedChange={setChecked} />
 * 
 * // With label
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Agree to terms</Label>
 * </div>
 * 
 * // Disabled
 * <Checkbox disabled />
 * ```
 */
const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary dark:border-primary/70 dark:focus-visible:ring-ring/50",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }