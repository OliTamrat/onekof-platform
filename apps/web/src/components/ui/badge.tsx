import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-gray-100 dark:bg-[#2C333A] text-gray-900 dark:text-white border-gray-200 dark:border-[#2C333A]",
  secondary: "bg-gray-200 dark:bg-[#282E33] text-gray-900 dark:text-white border-gray-300 dark:border-[#2C333A]",
  destructive: "bg-red-100 dark:bg-red-900/20 text-red-900 dark:text-red-400 border-red-200 dark:border-red-900",
  outline: "border-gray-300 dark:border-[#2C333A] text-gray-900 dark:text-white bg-transparent",
  success: "bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-400 border-green-200 dark:border-green-900",
  warning: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
  info: "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400 border-blue-200 dark:border-blue-900",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
