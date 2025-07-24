import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Heading, Text } from "./typography"
import { Search } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  className?: string
  size?: "sm" | "default" | "lg"
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    icon: Icon = Search, 
    title, 
    description, 
    action, 
    className, 
    size = "default",
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "py-8",
      default: "py-12",
      lg: "py-16"
    }

    const iconSizes = {
      sm: "h-8 w-8",
      default: "h-12 w-12", 
      lg: "h-16 w-16"
    }

    const containerSizes = {
      sm: "w-12 h-12",
      default: "w-16 h-16",
      lg: "w-20 h-20"
    }

    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center text-center space-y-4",
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        <div className={cn(
          "rounded-full bg-muted/50 flex items-center justify-center",
          containerSizes[size]
        )}>
          <Icon className={cn("text-muted-foreground", iconSizes[size])} />
        </div>
        
        <div className="space-y-2 max-w-md">
          <Heading level="h3" className={cn(
            size === "sm" ? "text-lg" : 
            size === "lg" ? "text-2xl" : "text-xl"
          )}>
            {title}
          </Heading>
          
          {description && (
            <Text variant="muted" className={cn(
              size === "sm" ? "text-sm" : "text-base"
            )}>
              {description}
            </Text>
          )}
        </div>

        {action && (
          <Button 
            onClick={action.onClick}
            variant={action.variant || "default"}
            size={size === "sm" ? "sm" : "default"}
          >
            {action.label}
          </Button>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }