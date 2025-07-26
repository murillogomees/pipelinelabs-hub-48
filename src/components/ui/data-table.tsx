
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface Action<T> {
  label: string;
  icon?: React.ReactNode | ((row: T) => React.ReactNode);
  onClick: (row: T) => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
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
  rowClassName?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  className,
  rowClassName,
}: DataTableProps<T>) {
  const getValue = (row: T, key: string) => {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
                {actions && actions.length > 0 && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell>
                      <div className="flex space-x-2">
                        {actions.map((_, actionIndex) => (
                          <Skeleton key={actionIndex} className="h-8 w-20" />
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="text-right min-w-[200px]">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions && actions.length > 0 ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={index}
                    className={rowClassName ? rowClassName(row) : ''}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {column.render
                          ? column.render(getValue(row, column.key as string), row)
                          : getValue(row, column.key as string)
                        }
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          {actions
                            .filter(action => !action.show || action.show(row))
                            .map((action, actionIndex) => {
                              const IconComponent = typeof action.icon === 'function' 
                                ? action.icon(row) 
                                : action.icon;
                              
                              const actionClassName = typeof action.className === 'function'
                                ? action.className(row)
                                : action.className;

                              return (
                                <Button
                                  key={actionIndex}
                                  size="sm"
                                  variant={action.variant || 'outline'}
                                  onClick={() => action.onClick(row)}
                                  className={actionClassName}
                                  title={action.label}
                                >
                                  {IconComponent && React.isValidElement(IconComponent) 
                                    ? IconComponent 
                                    : React.createElement(IconComponent as React.ComponentType<any>, { className: "h-4 w-4" })
                                  }
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
      </CardContent>
    </Card>
  );
}

// Utility components for common renders
export const renderBadge = (value: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default') => (
  <Badge variant={variant}>{value}</Badge>
);

export const renderStatus = (isActive: boolean) => (
  <Badge variant={isActive ? 'default' : 'secondary'}>
    {isActive ? 'Ativo' : 'Inativo'}
  </Badge>
);

export const renderEmail = (email: string) => (
  <div className="flex items-center">
    <span className="truncate max-w-[200px]" title={email}>
      {email}
    </span>
  </div>
);

export const renderDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const renderDateTime = (date: string) => {
  return new Date(date).toLocaleString('pt-BR');
};
