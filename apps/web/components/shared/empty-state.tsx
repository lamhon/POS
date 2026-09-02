import * as React from "react"
import { Typography } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <Typography variant="h3" className="mb-2">
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" className="mb-6 max-w-sm text-base">
          {description}
        </Typography>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
