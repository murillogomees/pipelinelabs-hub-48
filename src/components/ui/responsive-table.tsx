import * as React from "react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Card, CardContent } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"
import { LoadingSpinner } from "./loading-spinner"
import { EmptyState } from "./empty-state"

export interface ResponsiveTableColumn<T = any> {
  key: string
  label: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  className?: string
  hideOnMobile?: boolean
}

export interface ResponsiveTableAction<T = any> {
  icon: React.ElementType
  label: string
  onClick: (item: T) => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  show?: (item: T) => boolean
  className?: string
}

export interface ResponsiveTableProps<T = any> {
  data: T[]
  columns: ResponsiveTableColumn<T>[]
  actions?: ResponsiveTableAction<T>[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ElementType
  onRowClick?: (item: T) => void
  className?: string
  mobileCardRender?: (item: T, actions?: ResponsiveTableAction<T>[]) => React.ReactNode
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "Nenhum item encontrado",
  emptyIcon,
  onRowClick,
  className,
  mobileCardRender,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full">
        <LoadingSpinner size="lg" text="Carregando dados..." className="py-12" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        icon={emptyIcon}
        className="py-12"
      />
    )
  }

  // Desktop table view
  const DesktopTable = () => (
    <div className="hidden md:block">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn(column.className)}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="text-right w-20">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={item.id || index}
              className={onRowClick ? "cursor-pointer" : ""}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render 
                    ? column.render(item[column.key], item)
                    : item[column.key]
                  }
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {actions
                      .filter(action => !action.show || action.show(item))
                      .map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || "ghost"}
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick(item)
                          }}
                          className={action.className}
                        >
                          <action.icon className="h-4 w-4" />
                          <span className="sr-only">{action.label}</span>
                        </Button>
                      ))
                    }
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  // Mobile card view
  const MobileCards = () => (
    <div className="md:hidden space-y-3">
      {data.map((item, index) => {
        if (mobileCardRender) {
          return (
            <div key={item.id || index}>
              {mobileCardRender(item, actions)}
            </div>
          )
        }

        return (
          <Card 
            key={item.id || index}
            className={cn(
              "p-4 space-y-3",
              onRowClick && "cursor-pointer hover:shadow-md transition-shadow"
            )}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-0">
              <div className="space-y-2">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map((column) => (
                    <div key={column.key} className="flex justify-between items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground min-w-0 flex-1">
                        {column.label}:
                      </span>
                      <span className="text-sm text-right min-w-0 flex-1">
                        {column.render 
                          ? column.render(item[column.key], item)
                          : item[column.key]
                        }
                      </span>
                    </div>
                  ))
                }
              </div>
              
              {actions.length > 0 && (
                <div className="flex justify-end gap-2 pt-3 border-t">
                  {actions
                    .filter(action => !action.show || action.show(item))
                    .map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant || "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          action.onClick(item)
                        }}
                        className={action.className}
                      >
                        <action.icon className="h-4 w-4 mr-1" />
                        {action.label}
                      </Button>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="w-full">
      <DesktopTable />
      <MobileCards />
    </div>
  )
}