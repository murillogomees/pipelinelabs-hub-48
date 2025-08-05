
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface SearchFilters {
  query?: string;
  is_active?: boolean;
  low_stock?: boolean;
  out_of_stock?: boolean;
  min_price?: number;
  max_price?: number;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
  isLoading: boolean;
}

export function ProductFilters({ onFiltersChange, currentFilters, isLoading }: ProductFiltersProps) {
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
                placeholder="Buscar por nome, código ou código de barras..."
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
                value={localFilters.is_active?.toString()}
                onValueChange={(value) => 
                  setLocalFilters({ 
                    ...localFilters, 
                    is_active: value === '' ? undefined : value === 'true' 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Preço min"
                  value={localFilters.min_price || ''}
                  onChange={(e) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      min_price: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Preço max"
                  value={localFilters.max_price || ''}
                  onChange={(e) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      max_price: e.target.value ? Number(e.target.value) : undefined 
                    })
                  }
                />
              </div>

              <div className="flex gap-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localFilters.low_stock || false}
                    onChange={(e) => 
                      setLocalFilters({ ...localFilters, low_stock: e.target.checked || undefined })
                    }
                  />
                  <span>Estoque baixo</span>
                </label>
              </div>

              <div className="flex gap-2">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={localFilters.out_of_stock || false}
                    onChange={(e) => 
                      setLocalFilters({ ...localFilters, out_of_stock: e.target.checked || undefined })
                    }
                  />
                  <span>Sem estoque</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
