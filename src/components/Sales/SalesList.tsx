
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Sale {
  id: string;
  sale_number?: string;
  customer_id?: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  sale_date?: string;
  payment_method?: string;
  payment_status?: string;
}

interface SalesListProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onCancel: (saleId: string, reason?: string) => void;
  isLoading: boolean;
}

export function SalesList({ sales, onEdit, onCancel, isLoading }: SalesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <Card key={sale.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  Venda #{sale.sale_number || sale.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-600">
                  {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('pt-BR') : 'Data não informada'}
                </p>
              </div>
              <Badge className={getStatusColor(sale.status)}>
                {getStatusLabel(sale.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Valor Total:</span>
                <p className="font-semibold text-lg">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(sale.total_amount)}
                </p>
              </div>
              
              {sale.payment_method && (
                <div>
                  <span className="text-sm text-gray-600">Pagamento:</span>
                  <p className="font-medium">{sale.payment_method}</p>
                </div>
              )}

              {sale.payment_status && (
                <div>
                  <span className="text-sm text-gray-600">Status Pagamento:</span>
                  <Badge variant="outline">
                    {sale.payment_status === 'paid' ? 'Pago' :
                     sale.payment_status === 'pending' ? 'Pendente' :
                     sale.payment_status === 'partial' ? 'Parcial' : 'Cancelado'}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(sale)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              {sale.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(sale.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
