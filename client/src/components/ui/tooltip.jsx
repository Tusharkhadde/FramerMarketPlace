import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Tooltip Provider - Wrapper component that manages tooltip state
 * 
 * Should wrap all tooltip components in your application
 * for better performance and consistent behavior.
 * 
 * @param {number} [delayDuration=0] - Delay before showing tooltip in ms
 * 
 * @example
 * ```jsx
 * <TooltipProvider delayDuration={200}>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>This is a tooltip</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return (<TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />);
}

/**
 * Tooltip - Root tooltip component
 * 
 * Container for TooltipTrigger and TooltipContent
 */
function Tooltip({
  ...props
}) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

/**
 * TooltipTrigger - Element that triggers the tooltip
 */
function TooltipTrigger({
  ...props
}) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" tabIndex={0} {...props} />;
}

/**
 * TooltipContent - Tooltip content that appears on hover
 * 
 * Features:
 * - Auto positioning based on available space
 * - Arrow indicator pointing to trigger
 * - Smooth animations
 * - Dark mode optimized
 * - Keyboard accessible
 * 
 * @param {number} [sideOffset=0] - Distance from trigger
 * @param {string} [align='center'] - Horizontal alignment
 * @param {string} [side='top'] - Preferred side to show tooltip
 */
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background font-medium shadow-lg has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 dark:bg-foreground dark:text-background",
          className
        )}
        {...props}>
        {children}
        <TooltipPrimitive.Arrow
          className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground dark:bg-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
