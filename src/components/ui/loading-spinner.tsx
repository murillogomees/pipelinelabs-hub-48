import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        xs: "h-3 w-3",
        sm: "h-4 w-4", 
        default: "h-5 w-5",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        destructive: "text-destructive",
        success: "text-green-600",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, ...props }, ref) => {
    return (
      <div 
        className={cn("flex items-center justify-center gap-2", className)}
        ref={ref} 
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))} />
        {text && (
          <span className="text-sm text-muted-foreground">{text}</span>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Loading states for different contexts
const LoadingCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-center h-32", className)} {...props}>
    <LoadingSpinner size="lg" text="Carregando..." />
  </div>
)

const LoadingPage = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-center min-h-[50vh]", className)} {...props}>
    <LoadingSpinner size="xl" text="Carregando página..." />
  </div>
)

const LoadingButton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <LoadingSpinner size="sm" className={cn("mr-2", className)} {...props} />
)

export { LoadingSpinner, LoadingCard, LoadingPage, LoadingButton, spinnerVariants }