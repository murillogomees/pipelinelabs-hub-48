import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Heading, Text } from "./typography"
import { Badge } from "./badge"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ElementType
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
  variant?: "default" | "success" | "warning" | "destructive"
  className?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon: Icon, trend, variant = "default", className, ...props }, ref) => {
    const trendColors = {
      up: "text-green-600",
      down: "text-red-600", 
      neutral: "text-muted-foreground"
    }

    const cardVariants = {
      default: "",
      success: "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50",
      warning: "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50",
      destructive: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50"
    }

    return (
      <Card 
        className={cn(cardVariants[variant], className)}
        ref={ref} 
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Heading level="h3" className="text-2xl font-bold">
              {value}
            </Heading>
            
            <div className="flex items-center gap-2">
              {trend && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", trendColors[trend.direction])}
                >
                  {trend.direction === "up" && "↗"}
                  {trend.direction === "down" && "↘"}
                  {trend.direction === "neutral" && "→"}
                  {Math.abs(trend.value)}% {trend.label}
                </Badge>
              )}
              
              {description && (
                <Text variant="muted" size="sm">
                  {description}
                </Text>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }