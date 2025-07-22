import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, Eye, Edit, Trash2, Download, RefreshCw } from 'lucide-react';
import { TableSuspenseBoundary } from '@/components/Common/SuspenseBoundary';

interface BaseTableColumn<T = any> {
  key: string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface BaseTableAction<T = any> {
  icon: React.ElementType;
  label: string;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  show?: (item: T) => boolean;
  className?: string;
}

interface BaseTableFilter {
  key: string;
  label: string;
  type: 'select' | 'input' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface BaseTableProps<T = any> {
  title?: string;
  data: T[];
  columns: BaseTableColumn<T>[];
  actions?: BaseTableAction<T>[];
  filters?: BaseTableFilter[];
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ElementType;
  onCreateNew?: () => void;
  createNewLabel?: string;
  showExport?: boolean;
  onExport?: () => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const BaseTable = <T extends Record<string, any>>({
  title,
  data,
  columns,
  actions = [],
  filters = [],
  searchable = true,
  searchPlaceholder = 'Buscar...',
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon: EmptyIcon = Search,
  onCreateNew,
  createNewLabel = 'Novo Item',
  showExport = false,
  onExport,
  showRefresh = false,
  onRefresh,
  className = ''
}: BaseTableProps<T>) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filtrar dados
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Aplicar busca
    if (searchTerm && searchable) {
      result = result.filter(item => {
        return columns.some(column => {
          const value = item[column.key];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Aplicar filtros
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => {
          return String(item[key]).toLowerCase() === value.toLowerCase();
        });
      }
    });

    // Aplicar ordenação
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, activeFilters, sortConfig, columns, searchable]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilters({});
    setSortConfig(null);
  };

  return (
    <Card className={className}>
      {(title || onCreateNew || searchable || filters.length > 0) && (
        <CardHeader>
          <div className="flex flex-col space-y-4">
            {/* Título e ações principais */}
            {(title || onCreateNew || showExport || showRefresh) && (
              <div className="flex items-center justify-between">
                <div>
                  {title && <CardTitle className="text-2xl font-bold">{title}</CardTitle>}
                </div>
                <div className="flex items-center space-x-2">
                  {showRefresh && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRefresh}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {showExport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onExport}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  )}
                  {onCreateNew && (
                    <Button onClick={onCreateNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      {createNewLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Filtros e busca */}
            {(searchable || filters.length > 0) && (
              <div className="flex flex-col sm:flex-row gap-4">
                {searchable && (
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
                
                {filters.map(filter => (
                  <div key={filter.key} className="w-full sm:w-48">
                    {filter.type === 'select' ? (
                      <Select
                        value={activeFilters[filter.key] || ''}
                        onValueChange={(value) => handleFilterChange(filter.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filter.placeholder || filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          {filter.options?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={filter.type}
                        placeholder={filter.placeholder || filter.label}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                {(searchTerm || Object.values(activeFilters).some(v => v)) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="whitespace-nowrap"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <TableSuspenseBoundary>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                    style={column.width ? { width: column.width } : undefined}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <EmptyIcon className="h-12 w-12 text-muted-foreground" />
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
                        {onCreateNew && (
                          <Button onClick={onCreateNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            {createNewLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={item.id || index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className || ''}>
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]
                        }
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {actions.map((action, actionIndex) => {
                            const shouldShow = action.show ? action.show(item) : true;
                            if (!shouldShow) return null;

                            return (
                              <Button
                                key={actionIndex}
                                variant={action.variant || 'ghost'}
                                size="sm"
                                onClick={() => action.onClick(item)}
                                className={action.className || ''}
                                title={action.label}
                              >
                                <action.icon className="h-4 w-4" />
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
        </TableSuspenseBoundary>
      </CardContent>
    </Card>
  );
};