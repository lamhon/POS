import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  secondaryAction?: React.ReactNode
}

export function ErrorState({
  icon,
  title = "Something went wrong",
  description = "There was an error while trying to process your request. Please try again later.",
  onRetry,
  retryLabel = "Try Again",
  secondaryAction,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4 text-destructive">
        {icon || <AlertCircle className="h-8 w-8" />}
      </div>
      <Typography variant="h4" className="mb-2 text-destructive">
        {title}
      </Typography>
      <Typography variant="caption" className="mb-6 max-w-md text-base text-destructive/80">
        {description}
      </Typography>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button variant="destructive" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  )
}
