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
import { Plus, Minus, Trash2, Search, X, Check, ShoppingCart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateSale, Sale, CreateSaleData } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import { FormSection } from '@/components/ui/form-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const isMobile = useMobile();

  const [searchProduct, setSearchProduct] = useState('');
  const [activeTab, setActiveTab] = useState('info');
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
      setActiveTab('info');
    }
  }, [sale, isOpen]);

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
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[90vh] p-0' : 'max-w-6xl max-h-[90vh]'} overflow-hidden`}>
        {/* Header Mobile Otimizado */}
        <div className={`sticky top-0 z-20 bg-background border-b ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {sale ? 'Editar Pedido' : 'Novo Pedido'}
                </h2>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    {sale ? `Editando pedido #${sale.sale_number}` : 'Criar um novo pedido de venda'}
                  </p>
                )}
              </div>
            </div>

            {!isMobile && (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createSale.isPending || items.length === 0}
                  className="bg-primary text-primary-foreground"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {createSale.isPending ? 'Salvando...' : (sale ? 'Atualizar' : 'Criar Pedido')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 pb-20' : 'p-6 pt-0'}`}>
          {isMobile ? (
            /* Layout Mobile com Tabs */
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="sticky top-0 z-10 bg-background py-4 -mx-4 px-4 border-b mb-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                  <TabsTrigger value="info" className="text-xs">Informações</TabsTrigger>
                  <TabsTrigger value="items" className="text-xs">
                    Itens ({items.length})
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">Resumo</TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Informações */}
              <TabsContent value="info" className="space-y-4 mt-0">
                <FormSection title="Dados do Pedido" showDivider={false}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer">Cliente (opcional)</Label>
                      <Select
                        value={formData.customer_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                      >
                        <SelectTrigger className="h-12 text-base">
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
                        placeholder="Observações do pedido..."
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="min-h-[100px] text-base resize-none"
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
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                </FormSection>
              </TabsContent>

              {/* Tab Itens */}
              <TabsContent value="items" className="space-y-4 mt-0">
                <FormSection title="Buscar Produtos" showDivider={false}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Nome ou código do produto..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>

                  {searchProduct && (
                    <div className="max-h-48 overflow-y-auto space-y-2 bg-muted/30 rounded-lg p-2">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => addProduct(product.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">R$ {Number(product.price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Est: {product.stock_quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FormSection>

                <FormSection title={`Itens Adicionados (${items.length})`} showDivider={false}>
                  {items.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">Nenhum item adicionado</p>
                      <p className="text-sm text-muted-foreground">Busque produtos acima para adicionar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product_id} className="bg-background border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.product_name}</h4>
                              <p className="text-sm text-muted-foreground">{item.product_code}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product_id)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Quantidade</Label>
                              <div className="flex items-center gap-1 mt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="flex-1 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Desconto (R$)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.discount}
                                onChange={(e) => updateItemDiscount(item.product_id, Number(e.target.value))}
                                className="h-8 text-sm mt-1"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <span className="text-sm text-muted-foreground">
                              R$ {item.unit_price.toFixed(2)} × {item.quantity}
                            </span>
                            <span className="font-semibold text-primary">
                              R$ {item.total_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FormSection>
              </TabsContent>

              {/* Tab Resumo */}
              <TabsContent value="summary" className="space-y-4 mt-0">
                <FormSection title="Resumo do Pedido" showDivider={false}>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Itens ({items.length})</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Desconto</span>
                      <span>- R$ {formData.discount.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {formData.customer_id && (
                    <div className="bg-background border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Cliente</h4>
                      <p className="text-sm text-muted-foreground">
                        {customers.find(c => c.id === formData.customer_id)?.name || 'Cliente selecionado'}
                      </p>
                    </div>
                  )}

                  {formData.notes && (
                    <div className="bg-background border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Observações</h4>
                      <p className="text-sm text-muted-foreground">{formData.notes}</p>
                    </div>
                  )}
                </FormSection>
              </TabsContent>
            </Tabs>
          ) : (
            /* Layout Desktop */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações da Venda */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Informações do Pedido</CardTitle>
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
                        placeholder="Observações do pedido..."
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
                <Card className="border-0 shadow-sm">
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
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
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
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Itens do Pedido ({items.length} itens)</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground text-lg mb-2">Nenhum item adicionado</p>
                      <p className="text-sm text-muted-foreground">Busque produtos acima para adicionar ao pedido</p>
                    </div>
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
                                  <span className="w-8 text-center font-medium">{item.quantity}</span>
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
                              <TableCell className="font-medium text-primary">
                                R$ {item.total_price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItem(item.product_id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
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
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal ({items.length} itens):</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Desconto:</span>
                      <span>- R$ {formData.discount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </div>

        {/* Botões de Ação Mobile Fixos */}
        {isMobile && (
          <div className="sticky bottom-0 z-20 bg-background border-t p-4">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-12 font-medium"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createSale.isPending || items.length === 0}
                className="flex-1 h-12 font-medium bg-primary text-primary-foreground"
              >
                {createSale.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{sale ? 'Atualizar' : 'Criar Pedido'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}