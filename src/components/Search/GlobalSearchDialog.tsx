import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  User, 
  Package, 
  ShoppingCart, 
  FileText, 
  Receipt, 
  DollarSign,
  UserPlus,
  Command,
  ArrowRight
} from 'lucide-react';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  User,
  Package,
  ShoppingCart,
  FileText,
  Receipt,
  DollarSign,
  UserPlus,
  Search,
};

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState('');
  const { data: results = [], isLoading } = useGlobalSearch(query);
  const navigate = useNavigate();

  // Clear query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  // Group results by category
  const groupedResults = results.reduce((groups, result) => {
    const category = result.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b">
          <div className="flex items-center px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground mr-3" />
            <Input
              placeholder="Buscar por clientes, produtos, pedidos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 shadow-none focus-visible:ring-0 text-base"
              autoFocus
            />
            <div className="flex items-center text-xs text-muted-foreground ml-3">
              <Command className="w-3 h-3 mr-1" />
              <span>ESC</span>
            </div>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {query.length < 2 && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Você pode buscar por:</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  <Badge variant="outline">Nomes de clientes</Badge>
                  <Badge variant="outline">Códigos de produtos</Badge>
                  <Badge variant="outline">Números de pedidos</Badge>
                  <Badge variant="outline">Ações rápidas</Badge>
                </div>
              </div>
            </div>
          )}

          {query.length >= 2 && isLoading && (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.length >= 2 && !isLoading && results.length === 0 && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Nenhum resultado encontrado
              </p>
              <p className="text-xs text-muted-foreground">
                Tente buscar por nome, código, número ou CPF/CNPJ
              </p>
            </div>
          )}

          {query.length >= 2 && !isLoading && results.length > 0 && (
            <div className="p-2">
              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 mb-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {category}
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    {categoryResults.map((result) => {
                      const Icon = iconMap[result.icon as keyof typeof iconMap] || Search;
                      
                      return (
                        <Button
                          key={result.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-3 text-left hover:bg-accent"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="p-1.5 rounded-md bg-primary/10">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {result.title}
                              </p>
                              {result.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </p>
                              )}
                            </div>
                            
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="border-t px-4 py-2 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Use ↑↓ para navegar • Enter para selecionar • ESC para fechar
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}