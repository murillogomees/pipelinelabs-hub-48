
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface Action<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string | ((row: T) => string);
  show?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  loading,
  emptyMessage = 'Nenhum item encontrado',
  className
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Carregando...</span>
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {actions && actions.length > 0 && (
              <TableHead className="w-[120px]">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length + (actions ? 1 : 0)} 
                className="h-24 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className={column.className}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell>
                    <div className="flex space-x-2">
                      {actions
                        .filter(action => !action.show || action.show(row))
                        .map((action, actionIndex) => {
                          const IconComponent = action.icon;
                          const className = typeof action.className === 'function' 
                            ? action.className(row) 
                            : action.className;
                          
                          return (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'outline'}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              className={className}
                              title={action.label}
                            >
                              <IconComponent className="w-4 h-4" />
                            </Button>
                          );
                        })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Utility functions for common renders
export function renderBadge(value: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default') {
  return (
    <Badge variant={variant}>
      {value}
    </Badge>
  );
}

export function renderStatus(isActive: boolean) {
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}

export function renderEmail(email: string) {
  return (
    <div className="flex items-center space-x-2">
      <Mail className="w-4 h-4 text-muted-foreground" />
      <span className="truncate max-w-[200px]" title={email}>
        {email}
      </span>
    </div>
  );
}
