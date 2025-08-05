
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilters {
  query?: string;
  status?: string;
  payment_status?: string;
  sale_type?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

interface SaleFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
  isLoading: boolean;
}

export function SaleFilters({ onFiltersChange, currentFilters, isLoading }: SaleFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(currentFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(currentFilters).some(key => currentFilters[key as keyof SearchFilters]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por número da venda..."
                value={localFilters.query || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, query: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <Select
                value={localFilters.status || ''}
                onValueChange={(value) => 
                  setLocalFilters({ 
                    ...localFilters, 
                    status: value || undefined 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={localFilters.payment_status || ''}
                onValueChange={(value) => 
                  setLocalFilters({ 
                    ...localFilters, 
                    payment_status: value || undefined 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={localFilters.date_from || ''}
                  onChange={(e) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      date_from: e.target.value || undefined 
                    })
                  }
                />
                <Input
                  type="date"
                  placeholder="Data final"
                  value={localFilters.date_to || ''}
                  onChange={(e) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      date_to: e.target.value || undefined 
                    })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Valor min"
                  value={localFilters.min_amount || ''}
                  onChange={(e) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      min_amount: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Valor max"
                  value={localFilters.max_amount || ''}
                  onChange={(e) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      max_amount: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
