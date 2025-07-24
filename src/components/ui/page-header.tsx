import * as React from "react"
import { cn } from "@/lib/utils"
import { Heading, Text } from "./typography"
import { Separator } from "./separator"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  showSeparator?: boolean
  className?: string
  children?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, action, showSeparator = true, className, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-4", className)} ref={ref} {...props}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <Heading level="h1" className="text-2xl sm:text-3xl">
              {title}
            </Heading>
            {description && (
              <Text variant="muted" className="text-sm sm:text-base">
                {description}
              </Text>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
        {children}
        {showSeparator && <Separator className="my-6" />}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }