import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const MovingBorder = ({
  children,
  duration = 2000,
  rx = "30%",
  ry = "30%",
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...props
}) => {
  return (
    <Component
      className={cn(
        "relative p-[1px] overflow-hidden bg-transparent",
        containerClassName
      )}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `${rx} ${ry}` }}
      >
        <motion.div
          className={cn(
            "absolute inset-[-1000%] bg-[conic-gradient(from_90deg_at_50%_50%,#22c55e_0%,#166534_50%,#22c55e_100%)]",
            borderClassName
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div
        className={cn(
          "relative bg-background backdrop-blur-xl",
          className
        )}
        style={{ borderRadius: `calc(${rx} - 1px) calc(${ry} - 1px)` }}
      >
        {children}
      </div>
    </Component>
  )
}