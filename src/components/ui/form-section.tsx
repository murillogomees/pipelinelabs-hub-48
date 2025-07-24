import * as React from "react"
import { cn } from "@/lib/utils"
import { Heading, Text } from "./typography"
import { Separator } from "./separator"

interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  showDivider?: boolean
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, children, className, showDivider = true, ...props }, ref) => {
    return (
      <div className={cn("space-y-6", className)} ref={ref} {...props}>
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <Heading level="h3" className="text-lg font-medium">
                {title}
              </Heading>
            )}
            {description && (
              <Text variant="muted" size="sm">
                {description}
              </Text>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
        
        {showDivider && <Separator />}
      </div>
    )
  }
)
FormSection.displayName = "FormSection"

export { FormSection }