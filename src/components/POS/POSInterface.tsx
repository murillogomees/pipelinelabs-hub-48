import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, ScanLine, Receipt, CreditCard } from 'lucide-react';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreatePOSSale, POSItem, POSPayment } from '@/hooks/usePOS';
import { useToast } from '@/hooks/use-toast';

interface POSState {
  items: POSItem[];
  customer_id?: string;
  payments: POSPayment[];
  discount: number;
  notes: string;
}

export function POSInterface() {
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const { customers = [] } = useCustomers();
  const createSale = useCreatePOSSale();
  
  const [searchProduct, setSearchProduct] = useState('');
  const [posState, setPosState] = useState<POSState>({
    items: [],
    payments: [],
    discount: 0,
    notes: '',
  });

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = posState.items.find(item => item.product_id === productId);
    
    if (existingItem) {
      updateItemQuantity(productId, existingItem.quantity + 1);
    } else {
      const newItem: POSItem = {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: 1,
        unit_price: Number(product.price),
        discount: 0,
        total_price: Number(product.price),
      };
      
      setPosState(prev => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
    setSearchProduct('');
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setPosState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product_id === productId
          ? {
              ...item,
              quantity,
              total_price: (item.unit_price - item.discount) * quantity,
            }
          : item
      ),
    }));
  };

  const removeItem = (productId: string) => {
    setPosState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product_id !== productId),
    }));
  };

  const addPayment = (method: POSPayment['method'], amount: number) => {
    setPosState(prev => ({
      ...prev,
      payments: [...prev.payments, { method, amount }],
    }));
  };

  const removePayment = (index: number) => {
    setPosState(prev => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index),
    }));
  };

  const subtotal = posState.items.reduce((sum, item) => sum + item.total_price, 0);
  const total = subtotal - posState.discount;
  const totalPaid = posState.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const change = totalPaid - total;

  const canFinalizeSale = posState.items.length > 0 && totalPaid >= total;

  const finalizeSale = async () => {
    if (!canFinalizeSale) {
      toast({
        title: 'Erro',
        description: 'Verifique os itens e pagamentos antes de finalizar.',
        variant: 'destructive',
      });
      return;
    }

    await createSale.mutateAsync({
      customer_id: posState.customer_id,
      total_amount: total,
      discount: posState.discount,
      tax_amount: 0,
      items: posState.items,
      payments: posState.payments,
      status: 'completed',
      notes: posState.notes,
    });

    // Limpar PDV após venda
    setPosState({
      items: [],
      payments: [],
      discount: 0,
      notes: '',
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.code.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Busca e Produtos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Produtos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">Buscar produto</Label>
            <Input
              id="search"
              placeholder="Nome ou código do produto..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => addProduct(product.id)}
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">R$ {Number(product.price).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Estoque: {product.stock_quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Carrinho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho ({posState.items.length} itens)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-2">
            {posState.items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">R$ {item.unit_price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeItem(item.product_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {posState.items.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum item no carrinho
            </p>
          )}
        </CardContent>
      </Card>

      {/* Finalização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Finalização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cliente */}
          <div>
            <Label htmlFor="customer">Cliente (opcional)</Label>
            <Select
              value={posState.customer_id || ''}
              onValueChange={(value) => setPosState(prev => ({ ...prev, customer_id: value || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resumo */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto:</span>
              <Input
                type="number"
                min="0"
                max={subtotal}
                step="0.01"
                value={posState.discount}
                onChange={(e) => setPosState(prev => ({ ...prev, discount: Number(e.target.value) }))}
                className="w-24 h-8"
              />
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pagamentos */}
          <div className="space-y-2">
            <Label>Pagamentos</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => addPayment('money', total - totalPaid)}
                disabled={totalPaid >= total}
              >
                Dinheiro
              </Button>
              <Button
                variant="outline"
                onClick={() => addPayment('pix', total - totalPaid)}
                disabled={totalPaid >= total}
              >
                PIX
              </Button>
              <Button
                variant="outline"
                onClick={() => addPayment('card', total - totalPaid)}
                disabled={totalPaid >= total}
              >
                Cartão
              </Button>
              <Button
                variant="outline"
                onClick={() => addPayment('boleto', total - totalPaid)}
                disabled={totalPaid >= total}
              >
                Boleto
              </Button>
            </div>
            
            {posState.payments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="capitalize">{payment.method}: R$ {payment.amount.toFixed(2)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removePayment(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {totalPaid > 0 && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total pago:</span>
                  <span>R$ {totalPaid.toFixed(2)}</span>
                </div>
                {change > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Troco:</span>
                    <span>R$ {change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              placeholder="Observações da venda..."
              value={posState.notes}
              onChange={(e) => setPosState(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Finalizar Venda */}
          <Button
            onClick={finalizeSale}
            disabled={!canFinalizeSale || createSale.isPending}
            className="w-full"
            size="lg"
          >
            <Receipt className="h-4 w-4 mr-2" />
            {createSale.isPending ? 'Finalizando...' : 'Finalizar Venda'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}