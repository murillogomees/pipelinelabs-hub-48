import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Search } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { formatCurrency } from '@/lib/utils';
import { purchaseOrderFormSchema, newItemFormSchema, type NewItemFormData } from './schema';
import type { PurchaseOrderFormData, OrderItem } from './types';

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PurchaseOrderFormData) => void;
  initialData?: Partial<PurchaseOrderFormData>;
}

export function PurchaseOrderDialog({ open, onOpenChange, onSubmit, initialData }: PurchaseOrderDialogProps) {
  const { suppliers } = useSuppliers();
  const { data: products } = useProducts();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      supplier_id: '',
      supplier_name: '',
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: '',
      status: 'draft',
      notes: '',
      internal_notes: '',
      discount: 0,
      tax_amount: 0,
      shipping_cost: 0,
      items: [],
    },
  });

  const itemForm = useForm<NewItemFormData>({
    resolver: zodResolver(newItemFormSchema),
    defaultValues: {
      product_id: '',
      quantity: 1,
      unit_price: 0,
      notes: '',
    },
  });

  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        supplier_id: initialData.supplier_id || '',
        supplier_name: initialData.supplier_name || '',
        order_date: initialData.order_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        delivery_date: initialData.delivery_date?.split('T')[0] || '',
        status: initialData.status || 'draft',
        notes: initialData.notes || '',
        internal_notes: initialData.internal_notes || '',
        discount: initialData.discount || 0,
        tax_amount: initialData.tax_amount || 0,
        shipping_cost: initialData.shipping_cost || 0,
        items: initialData.items || [],
      });
      setItems(initialData.items || []);
    } else if (!initialData && open) {
      form.reset();
      setItems([]);
      itemForm.reset();
    }
  }, [initialData, open, form, itemForm]);

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers?.find(s => s.id === supplierId);
    form.setValue('supplier_id', supplierId);
    form.setValue('supplier_name', supplier?.name || '');
  };

  const addItem = (data: NewItemFormData) => {
    const product = products?.find(p => p.id === data.product_id);
    if (!product) return;

    const item: OrderItem = {
      id: Date.now().toString(),
      product_id: data.product_id,
      product_name: product.name,
      quantity: data.quantity,
      unit_price: data.unit_price || product.cost_price || 0,
      total_price: data.quantity * (data.unit_price || product.cost_price || 0),
      notes: data.notes
    };

    const newItems = [...items, item];
    setItems(newItems);
    form.setValue('items', newItems);
    itemForm.reset({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      notes: ''
    });
  };

  const removeItem = (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    const newItems = items.map(item => 
      item.id === itemId 
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    );
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const updateItemPrice = (itemId: string, unit_price: number) => {
    const newItems = items.map(item => 
      item.id === itemId 
        ? { ...item, unit_price, total_price: item.quantity * unit_price }
        : item
    );
    setItems(newItems);
    form.setValue('items', newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discount = form.getValues('discount') || 0;
    const tax_amount = form.getValues('tax_amount') || 0;
    const shipping_cost = form.getValues('shipping_cost') || 0;
    const total = subtotal - discount + tax_amount + shipping_cost;
    return { subtotal, total };
  };

  const { subtotal, total } = calculateTotals();

  const handleFormSubmit = (data: PurchaseOrderFormData) => {
    const orderData = {
      ...data,
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
              <TabsTrigger value="itens">Itens</TabsTrigger>
              <TabsTrigger value="valores">Valores</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onValueChange={handleSupplierChange}
                          placeholder="Selecione um fornecedor"
                          staticOptions={suppliers?.map(supplier => ({
                            value: supplier.id,
                            label: supplier.name
                          })) || []}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Pedido *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Entrega</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações gerais do pedido"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Internas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações internas (não visíveis ao fornecedor)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        value={itemForm.watch('product_id')}
                        onValueChange={(value) => {
                          const product = products?.find(p => p.id === value);
                          itemForm.setValue('product_id', value);
                          itemForm.setValue('unit_price', product?.cost_price || 0);
                        }}
                        placeholder="Selecione um produto"
                        staticOptions={products?.map(product => ({
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
                        value={itemForm.watch('quantity')}
                        onChange={(e) => itemForm.setValue('quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={itemForm.watch('unit_price')}
                        onChange={(e) => itemForm.setValue('unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Input
                        value={itemForm.watch('notes')}
                        onChange={(e) => itemForm.setValue('notes', e.target.value)}
                        placeholder="Observações do item"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => itemForm.handleSubmit(addItem)()} 
                        className="w-full"
                      >
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
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desconto</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impostos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frete</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      <span className="text-red-600">-{formatCurrency(form.watch('discount') || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impostos:</span>
                      <span>{formatCurrency(form.watch('tax_amount') || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frete:</span>
                      <span>{formatCurrency(form.watch('shipping_cost') || 0)}</span>
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
            <Button 
              type="submit" 
              disabled={!form.watch('supplier_id') || items.length === 0}
            >
              {initialData ? 'Atualizar' : 'Criar'} Pedido
            </Button>
          </div>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}