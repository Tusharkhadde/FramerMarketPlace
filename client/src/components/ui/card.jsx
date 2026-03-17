import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card Component System
 * 
 * A flexible container component for grouping related content.
 * Use Card with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter
 * for a complete card layout.
 * 
 * Features:
 * - Responsive spacing based on card size
 * - Container queries for adaptive layouts
 * - Semantic HTML structure
 * - Dark mode support
 * - Smooth hover states
 * - Accessible focus management
 * 
 * @example
 * ```jsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description goes here</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Main card content
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */

/**
 * Card - Main container component
 * @param {string} [size='default'] - Card size variant (default | sm)
 */
function Card({
  className,
  size = "default",
  ...props
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      role="article"
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 shadow-sm hover:shadow-md transition-shadow duration-200 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props} />
  );
}

/**
 * CardHeader - Top section of the card
 * Contains title and description
 */
function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props} />
  );
}

/**
 * CardTitle - Title element for the card
 * Use semantic heading elements with forwardRef for better accessibility
 */
function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug font-semibold group-data-[size=sm]/card:text-sm tracking-tight",
        className
      )}
      {...props} />
  );
}

/**
 * CardDescription - Subtitle or description text
 */
function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground line-clamp-2", className)}
      {...props} />
  );
}

/**
 * CardAction - Optional action element positioned in the header
 * Typically used for action buttons or icons
 */
function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

/**
 * CardContent - Main content area of the card
 */
function CardContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3 text-foreground", className)}
      {...props} />
  );
}

/**
 * CardFooter - Bottom section of the card
 * Typically used for actions or additional information
 */
function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 rounded-b-xl border-t border-foreground/10 bg-muted/50 p-4 group-data-[size=sm]/card:p-3 dark:bg-muted/20",
        className
      )}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
