import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface SearchableOption {
  value: string
  label: string
  disabled?: boolean
}

interface SearchableSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  loadOptions?: (search: string, page: number) => Promise<{
    options: SearchableOption[]
    hasMore: boolean
    total: number
  }>
  staticOptions?: SearchableOption[]
  pageSize?: number
  emptyMessage?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder = "Selecione uma opção...",
  searchPlaceholder = "Buscar...",
  disabled = false,
  className,
  loadOptions,
  staticOptions = [],
  pageSize = 20,
  emptyMessage = "Nenhuma opção encontrada"
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [options, setOptions] = React.useState<SearchableOption[]>(staticOptions)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [hasMore, setHasMore] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [initialLoad, setInitialLoad] = React.useState(false)
  
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  // Buscar a opção selecionada tanto em options quanto em staticOptions
  const selectedOption = React.useMemo(() => {
    const allOptions = [...(staticOptions || []), ...(options || [])];
    return allOptions.find(option => option.value === value);
  }, [options, staticOptions, value])

  const loadOptionsData = React.useCallback(async (searchTerm: string = "", pageNum: number = 1, reset: boolean = false) => {
    if (!loadOptions) return

    setLoading(true)
    try {
      const result = await loadOptions(searchTerm, pageNum)
      if (reset) {
        setOptions(result.options || [])
      } else {
        setOptions(prev => [...(prev || []), ...(result.options || [])])
      }
      setHasMore(result.hasMore || false)
      setTotal(result.total || 0)
      setPage(pageNum)
    } catch (error) {
      console.error('Erro ao carregar opções:', error)
    } finally {
      setLoading(false)
    }
  }, [loadOptions])

  // Debounce search function
  const debouncedSearch = React.useCallback((searchTerm: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      if (loadOptions) {
        loadOptionsData(searchTerm, 1, true)
      }
    }, 300)
  }, [loadOptions, loadOptionsData])

  // Load initial data when opening
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && loadOptions && !initialLoad) {
      loadOptionsData("", 1, true)
      setInitialLoad(true)
    }
  }

  // Handle search input change
  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue)
    if (loadOptions) {
      debouncedSearch(searchValue)
    }
  }

  // Load more options on scroll
  const handleLoadMore = () => {
    if (hasMore && !loading && loadOptions) {
      loadOptionsData(search, page + 1, false)
    }
  }

  // Filter static options based on search
  const filteredStaticOptions = React.useMemo(() => {
    if (!search || loadOptions) return staticOptions || []
    return (staticOptions || []).filter(option =>
      option.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, staticOptions, loadOptions])

  const displayOptions = loadOptions ? (options || []) : filteredStaticOptions

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={handleSearchChange}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <ScrollArea className="max-h-60">
              {loading && page === 1 ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <>
                  {(displayOptions || []).length === 0 ? (
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {(displayOptions || []).map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            onValueChange?.(option.value === value ? "" : option.value)
                            setOpen(false)
                          }}
                          disabled={option.disabled}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                      {hasMore && (
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Carregando mais...
                              </>
                            ) : (
                              `Carregar mais (${total - (options || []).length} restantes)`
                            )}
                          </Button>
                        </div>
                      )}
                    </CommandGroup>
                  )}
                </>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}