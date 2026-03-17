"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Switch Component
 * 
 * A toggle switch for on/off boolean states.
 * 
 * Features:
 * - Two size variants (default, sm)
 * - Smooth animated thumb translation
 * - Full keyboard support (Space/Enter to toggle)
 * - Disabled state support
 * - Dark mode optimized colors
 * - High contrast focus states
 * 
 * @component
 * @param {boolean} [checked] - Controlled checked state
 * @param {Function} [onCheckedChange] - Checked state change handler
 * @param {boolean} [disabled] - Disabled state
 * @param {string} [size='default'] - Switch size (default | sm)
 * @param {string} [className] - Additional CSS classes
 * @param {string} [aria-label] - Accessibility label
 * 
 * @example
 * ```jsx
 * // Simple toggle
 * <Switch />
 * 
 * // Controlled switch
 * const [enabled, setEnabled] = useState(false)
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * 
 * // Small switch
 * <Switch size="sm" />
 * 
 * // With label
 * <div className="flex items-center gap-2">
 *   <Switch id="notifications" />
 *   <Label htmlFor="notifications">Enable Notifications</Label>
 * </div>
 * 
 * // Disabled state
 * <Switch disabled />
 * ```
 */
function Switch({
  className,
  size = "default",
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all duration-200 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-checked:shadow-sm data-unchecked:bg-input data-unchecked:shadow-sm dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform duration-200 group-data-[size=default]/switch:size-4 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground" />
    </SwitchPrimitive.Root>
  );
}

Switch.displayName = "Switch"

export { Switch }
