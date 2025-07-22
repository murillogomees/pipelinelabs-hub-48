import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/hooks/useProducts';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { formatCurrency } from '@/lib/utils';

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export function PurchaseOrderDialog({ open, onOpenChange, onSubmit, initialData }: PurchaseOrderDialogProps) {
  const { suppliers } = useSuppliers();
  const { products } = useProducts();

  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_name: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'draft',
    notes: '',
    internal_notes: '',
    discount: 0,
    tax_amount: 0,
    shipping_cost: 0
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        supplier_id: initialData.supplier_id || '',
        supplier_name: initialData.supplier_name || '',
        order_date: initialData.order_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        delivery_date: initialData.delivery_date?.split('T')[0] || '',
        status: initialData.status || 'draft',
        notes: initialData.notes || '',
        internal_notes: initialData.internal_notes || '',
        discount: initialData.discount || 0,
        tax_amount: initialData.tax_amount || 0,
        shipping_cost: initialData.shipping_cost || 0
      });
      setItems(initialData.items || []);
    } else {
      // Reset form
      setFormData({
        supplier_id: '',
        supplier_name: '',
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        status: 'draft',
        notes: '',
        internal_notes: '',
        discount: 0,
        tax_amount: 0,
        shipping_cost: 0
      });
      setItems([]);
    }
  }, [initialData, open]);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers?.find(s => s.id === supplierId);
    setFormData(prev => ({
      ...prev,
      supplier_id: supplierId,
      supplier_name: supplier?.name || ''
    }));
  };

  const addItem = () => {
    if (!newItem.product_id) return;

    const product = products?.find(p => p.id === newItem.product_id);
    if (!product) return;

    const item: OrderItem = {
      id: Date.now().toString(),
      product_id: newItem.product_id,
      product_name: product.name,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price || product.cost_price || 0,
      total_price: newItem.quantity * (newItem.unit_price || product.cost_price || 0),
      notes: newItem.notes
    };

    setItems(prev => [...prev, item]);
    setNewItem({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      notes: ''
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ));
  };

  const updateItemPrice = (itemId: string, unit_price: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, unit_price, total_price: item.quantity * unit_price }
        : item
    ));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const total = subtotal - formData.discount + formData.tax_amount + formData.shipping_cost;
    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      ...formData,
      items,
      subtotal,
      total_amount: total
    };

    onSubmit(orderData);
  };

  const statusOptions = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'sent', label: 'Enviado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'partially_received', label: 'Parcialmente Recebido' },
    { value: 'received', label: 'Recebido' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Pedido de Compra' : 'Novo Pedido de Compra'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
              <TabsTrigger value="itens">Itens</TabsTrigger>
              <TabsTrigger value="valores">Valores</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Fornecedor *</Label>
                  <SearchableSelect
                    value={formData.supplier_id}
                    onValueChange={handleSupplierChange}
                    placeholder="Selecione um fornecedor"
                    options={suppliers?.map(supplier => ({
                      value: supplier.id,
                      label: supplier.name
                    })) || []}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_date">Data do Pedido *</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Data de Entrega</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações gerais do pedido"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal_notes">Observações Internas</Label>
                <Textarea
                  id="internal_notes"
                  value={formData.internal_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
                  placeholder="Observações internas (não visíveis ao fornecedor)"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="itens" className="space-y-4">
              {/* Add Item Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adicionar Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Produto</Label>
                      <SearchableSelect
                        value={newItem.product_id}
                        onValueChange={(value) => {
                          const product = products?.find(p => p.id === value);
                          setNewItem(prev => ({
                            ...prev,
                            product_id: value,
                            unit_price: product?.cost_price || 0
                          }));
                        }}
                        placeholder="Selecione um produto"
                        options={products?.map(product => ({
                          value: product.id,
                          label: `${product.name} - ${product.code}`
                        })) || []}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ 
                          ...prev, 
                          quantity: parseInt(e.target.value) || 1 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newItem.unit_price}
                        onChange={(e) => setNewItem(prev => ({ 
                          ...prev, 
                          unit_price: parseFloat(e.target.value) || 0 
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Input
                        value={newItem.notes}
                        onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observações do item"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button type="button" onClick={addItem} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Itens do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum item adicionado ao pedido
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Preço Unit.</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Observações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>{formatCurrency(item.total_price)}</TableCell>
                            <TableCell>{item.notes || '-'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="valores" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Desconto</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        discount: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_amount">Impostos</Label>
                    <Input
                      id="tax_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        tax_amount: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_cost">Frete</Label>
                    <Input
                      id="shipping_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.shipping_cost}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        shipping_cost: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo dos Valores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desconto:</span>
                      <span className="text-red-600">-{formatCurrency(formData.discount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impostos:</span>
                      <span>{formatCurrency(formData.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>{formatCurrency(formData.shipping_cost)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.supplier_id || items.length === 0}>
              {initialData ? 'Atualizar' : 'Criar'} Pedido
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}