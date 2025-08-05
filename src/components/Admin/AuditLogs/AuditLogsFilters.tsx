import { useState } from 'react';
import { CalendarIcon, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AuditLogFilters } from '@/hooks/useAuditLogs';

interface AuditLogsFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onExport: () => void;
}

export const AuditLogsFilters = ({ filters, onFiltersChange, onExport }: AuditLogsFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      limit: 100,
      offset: 0
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ação..."
            value={filters.action || ''}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Resource Type */}
            <div className="space-y-2">
              <Label htmlFor="resource-type">Tipo de Recurso</Label>
              <Select
                value={filters.resource_type || 'all'}
                onValueChange={(value) => handleFilterChange('resource_type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="invoice">Nota Fiscal</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="supplier">Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">Severidade</Label>
              <Select
                value={filters.severity || 'all'}
                onValueChange={(value) => handleFilterChange('severity', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.start_date ? format(filters.start_date, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.start_date}
                    onSelect={(date) => handleFilterChange('start_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.end_date ? format(filters.end_date, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.end_date}
                    onSelect={(date) => handleFilterChange('end_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};