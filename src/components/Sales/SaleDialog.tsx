import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateSale, Sale, CreateSaleData } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';

interface SaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale?: Sale;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export function SaleDialog({ isOpen, onClose, sale }: SaleDialogProps) {
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const { customers = [] } = useCustomers();
  const createSale = useCreateSale();

  const [searchProduct, setSearchProduct] = useState('');
  const [formData, setFormData] = useState({
    customer_id: '',
    notes: '',
    discount: 0,
  });
  const [items, setItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    if (sale) {
      setFormData({
        customer_id: sale.customer_id || '',
        notes: sale.notes || '',
        discount: sale.discount || 0,
      });
      
      if (sale.sale_items) {
        setItems(sale.sale_items.map(item => ({
          product_id: item.product_id,
          product_name: item.products?.name || '',
          product_code: item.products?.code || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          total_price: item.total_price,
        })));
      }
    } else {
      // Reset form for new sale
      setFormData({
        customer_id: '',
        notes: '',
        discount: 0,
      });
      setItems([]);
    }
  }, [sale]);

  const addProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = items.find(item => item.product_id === productId);
    
    if (existingItem) {
      updateItemQuantity(productId, existingItem.quantity + 1);
    } else {
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity: 1,
        unit_price: Number(product.price),
        discount: 0,
        total_price: Number(product.price),
      };
      
      setItems(prev => [...prev, newItem]);
    }
    setSearchProduct('');
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prev => prev.map(item =>
      item.product_id === productId
        ? {
            ...item,
            quantity,
            total_price: (item.unit_price - item.discount) * quantity,
          }
        : item
    ));
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    setItems(prev => prev.map(item =>
      item.product_id === productId
        ? {
            ...item,
            discount,
            total_price: (item.unit_price - discount) * item.quantity,
          }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const total = subtotal - formData.discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um item à venda.',
        variant: 'destructive',
      });
      return;
    }

    const saleData: CreateSaleData = {
      customer_id: formData.customer_id || undefined,
      sale_type: 'traditional',
      discount: formData.discount,
      total_amount: total,
      notes: formData.notes,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        total_price: item.total_price,
      })),
    };

    try {
      await createSale.mutateAsync(saleData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar venda:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.code.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sale ? 'Editar Venda' : 'Nova Venda'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações da Venda */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customer">Cliente (opcional)</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
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

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações da venda..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Desconto (R$)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Busca de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="searchProduct">Buscar produto</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="searchProduct"
                      placeholder="Nome ou código do produto..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
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
          </div>

          {/* Itens da Venda */}
          <Card>
            <CardHeader>
              <CardTitle>Itens da Venda ({items.length} itens)</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum item adicionado
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Preço Unit.</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.product_id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-sm text-muted-foreground">{item.product_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>R$ {item.unit_price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateItemDiscount(item.product_id, Number(e.target.value))}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            R$ {item.total_price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeItem(item.product_id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto:</span>
                  <span>R$ {formData.discount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createSale.isPending || items.length === 0}
            >
              {createSale.isPending ? 'Salvando...' : (sale ? 'Atualizar' : 'Criar Venda')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}