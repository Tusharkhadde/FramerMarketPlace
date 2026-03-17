"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Label Component
 * 
 * A form label component that associates text with form inputs.
 * 
 * Features:
 * - Semantic HTML label element
 * - Automatic disabled state inheritance
 * - Smooth transitions
 * - Proper cursor feedback
 * - Accessible focus management
 * - Works with controlled and uncontrolled inputs
 * 
 * @component
 * @param {string} [htmlFor] - ID of associated input element
 * @param {React.ReactNode} [children] - Label content
 * @param {string} [className] - Additional CSS classes
 * 
 * @example
 * ```jsx
 * // Basic usage
 * <Label htmlFor="email">Email Address</Label>
 * <Input id="email" type="email" />
 * 
 * // With required indicator
 * <Label htmlFor="password">
 *   Password <span className="text-destructive">*</span>
 * </Label>
 * <Input id="password" type="password" required />
 * 
 * // Disabled label
 * <Label htmlFor="disabled-field">Disabled Field</Label>
 * <Input id="disabled-field" disabled />
 * ```
 */
function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none transition-colors duration-200 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 cursor-pointer hover:text-foreground/90",
        className
      )}
      {...props} />
  );
}

Label.displayName = "Label"

export { Label }
