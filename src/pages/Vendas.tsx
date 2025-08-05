
import React, { useState } from 'react';
import { SalesList } from '@/components/Sales/SalesList';
import { SaleDialog } from '@/components/Sales/SaleDialog';
import { SaleFilters } from '@/components/Sales/SaleFilters';
import { useSalesManager } from '@/hooks/useSalesManager';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Vendas() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);

  const {
    sales,
    totalSales,
    isLoading,
    filters,
    searchSales,
    createSale,
    updateSale,
    cancelSale,
    isEmpty,
    isFiltered,
    pendingSales,
    completedSales
  } = useSalesManager();

  const handleCreateSale = async (saleData: any) => {
    try {
      await createSale(saleData);
      setIsDialogOpen(false);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleUpdateSale = async (saleData: any) => {
    if (!editingSale?.id) return;
    
    try {
      await updateSale(editingSale.id, saleData);
      setEditingSale(null);
      setIsDialogOpen(false);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  const handleEditSale = (sale: any) => {
    setEditingSale(sale);
    setIsDialogOpen(true);
  };

  const handleCancelSale = async (saleId: string, reason?: string) => {
    try {
      await cancelSale(saleId, reason);
    } catch (error) {
      // Error já tratado no hook
    }
  };

  // Calcular estatísticas rápidas
  const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
  const averageTicket = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600 mt-1">
            {totalSales} {totalSales === 1 ? 'venda' : 'vendas'} registradas
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSale(null);
            setIsDialogOpen(true);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Nova Venda
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(averageTicket)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingSales.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <SaleFilters
          onFiltersChange={searchSales}
          currentFilters={filters}
          isLoading={isLoading}
        />
      </div>

      {isEmpty && !isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {isFiltered 
              ? 'Nenhuma venda encontrada com os filtros aplicados'
              : 'Nenhuma venda registrada ainda'
            }
          </div>
          {!isFiltered && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeira Venda
            </Button>
          )}
        </div>
      ) : (
        <SalesList
          sales={sales}
          onEdit={handleEditSale}
          onCancel={handleCancelSale}
          isLoading={isLoading}
        />
      )}

      <SaleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        sale={editingSale}
        onSubmit={editingSale ? handleUpdateSale : handleCreateSale}
      />
    </div>
  );
}
