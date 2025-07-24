import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { OptimizedInput } from "./optimized-input"
import { EnhancedButton as Button } from "./enhanced-button"

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size'> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, showClearButton = true, placeholder = "Buscar...", ...props }, ref) => {
    const handleClear = () => {
      onChange("")
      onClear?.()
    }

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <OptimizedInput
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("pl-9", showClearButton && value && "pr-9", className)}
          size="default"
          fullWidth={true}
          {...props}
        />
        {showClearButton && value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }