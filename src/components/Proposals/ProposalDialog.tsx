import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, Trash2, FileText, Send, Check, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useProducts } from '@/components/Products/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateProposal, useUpdateProposal, useConvertProposalToSale, Proposal, ProposalItem } from '@/hooks/useProposals';

interface ProposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proposal?: Proposal;
}

export function ProposalDialog({ isOpen, onClose, proposal }: ProposalDialogProps) {
  const { data: products = [] } = useProducts();
  const { customers = [] } = useCustomers();
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const convertToSale = useConvertProposalToSale();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_id: '',
    expiration_date: undefined as Date | undefined,
    payment_terms: '',
    delivery_terms: '',
    notes: '',
    internal_notes: '',
  });

  const [items, setItems] = useState<ProposalItem[]>([]);
  const [services, setServices] = useState<ProposalItem[]>([]);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title,
        description: proposal.description || '',
        customer_id: proposal.customer_id || '',
        expiration_date: proposal.expiration_date ? new Date(proposal.expiration_date) : undefined,
        payment_terms: proposal.payment_terms || '',
        delivery_terms: proposal.delivery_terms || '',
        notes: proposal.notes || '',
        internal_notes: proposal.internal_notes || '',
      });
      setItems(proposal.items || []);
      setServices(proposal.services || []);
      setDiscount(proposal.discount || 0);
    } else {
      // Reset form for new proposal
      setFormData({
        title: '',
        description: '',
        customer_id: '',
        expiration_date: undefined,
        payment_terms: '',
        delivery_terms: '',
        notes: '',
        internal_notes: '',
      });
      setItems([]);
      setServices([]);
      setDiscount(0);
    }
  }, [proposal]);

  const addProduct = () => {
    const newItem: ProposalItem = {
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      total_price: 0,
    };
    setItems([...items, newItem]);
  };

  const addService = () => {
    const newService: ProposalItem = {
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      total_price: 0,
    };
    setServices([...services, newService]);
  };

  const updateItem = (index: number, updates: Partial<ProposalItem>) => {
    const updatedItems = [...items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      ...updates,
      total_price: (updates.unit_price || updatedItems[index].unit_price) * 
                   (updates.quantity || updatedItems[index].quantity) - 
                   (updates.discount || updatedItems[index].discount)
    };
    setItems(updatedItems);
  };

  const updateService = (index: number, updates: Partial<ProposalItem>) => {
    const updatedServices = [...services];
    updatedServices[index] = { 
      ...updatedServices[index], 
      ...updates,
      total_price: (updates.unit_price || updatedServices[index].unit_price) * 
                   (updates.quantity || updatedServices[index].quantity) - 
                   (updates.discount || updatedServices[index].discount)
    };
    setServices(updatedServices);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(index, {
        product_id: product.id,
        name: product.name,
        description: product.description || '',
        unit_price: Number(product.price),
      });
    }
  };

  const subtotal = [...items, ...services].reduce((sum, item) => sum + item.total_price, 0);
  const total = subtotal - discount;

  const handleSubmit = async () => {
    const proposalData = {
      ...formData,
      items,
      services,
      subtotal,
      discount,
      total_amount: total,
      expiration_date: formData.expiration_date?.toISOString().split('T')[0],
    };

    if (proposal) {
      await updateProposal.mutateAsync({ id: proposal.id, ...proposalData });
    } else {
      await createProposal.mutateAsync(proposalData);
    }
    onClose();
  };

  const handleConvertToSale = async () => {
    if (!proposal) return;
    await convertToSale.mutateAsync(proposal.id);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviada';
      case 'accepted': return 'Aceita';
      case 'rejected': return 'Rejeitada';
      case 'expired': return 'Vencida';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {proposal ? `Proposta ${proposal.proposal_number}` : 'Nova Proposta'}
            </DialogTitle>
            {proposal && (
              <Badge variant={getStatusColor(proposal.status)}>
                {getStatusText(proposal.status)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título da proposta"
              />
            </div>
            <div>
              <Label htmlFor="customer">Cliente</Label>
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
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da proposta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Validade</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiration_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiration_date ? (
                      format(formData.expiration_date, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expiration_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, expiration_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="payment_terms">Condições de Pagamento</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                placeholder="Ex: 30 dias"
              />
            </div>
          </div>

          {/* Produtos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Produtos</h3>
              <Button onClick={addProduct} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>

            {items.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-20">Qtd</TableHead>
                    <TableHead className="w-24">Preço Un.</TableHead>
                    <TableHead className="w-24">Desconto</TableHead>
                    <TableHead className="w-24">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={item.product_id || ''}
                          onValueChange={(value) => selectProduct(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {item.name || 'Selecionar produto...'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, { description: e.target.value })}
                          placeholder="Descrição"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => updateItem(index, { discount: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        R$ {item.total_price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Serviços */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Serviços</h3>
              <Button onClick={addService} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </div>

            {services.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-20">Qtd</TableHead>
                    <TableHead className="w-24">Preço Un.</TableHead>
                    <TableHead className="w-24">Desconto</TableHead>
                    <TableHead className="w-24">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={service.name}
                          onChange={(e) => updateService(index, { name: e.target.value })}
                          placeholder="Nome do serviço"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={service.description}
                          onChange={(e) => updateService(index, { description: e.target.value })}
                          placeholder="Descrição"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(index, { quantity: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.unit_price}
                          onChange={(e) => updateService(index, { unit_price: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.discount}
                          onChange={(e) => updateService(index, { discount: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        R$ {service.total_price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeService(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Totais */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Desconto:</span>
                <div className="flex items-center gap-2">
                  <span>R$</span>
                  <Input
                    type="number"
                    min="0"
                    max={subtotal}
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-24 h-8"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações para o cliente"
              />
            </div>
            <div>
              <Label htmlFor="internal_notes">Observações Internas</Label>
              <Textarea
                id="internal_notes"
                value={formData.internal_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, internal_notes: e.target.value }))}
                placeholder="Observações internas"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {proposal && proposal.status === 'draft' && (
                <Button
                  variant="outline"
                  onClick={() => updateProposal.mutateAsync({ id: proposal.id, status: 'sent', sent_at: new Date().toISOString() })}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              )}
              {proposal && proposal.status === 'sent' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateProposal.mutateAsync({ id: proposal.id, status: 'accepted', accepted_at: new Date().toISOString() })}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aceitar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateProposal.mutateAsync({ id: proposal.id, status: 'rejected', rejected_at: new Date().toISOString() })}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </>
              )}
              {proposal && proposal.status === 'accepted' && !proposal.converted_to_sale_id && (
                <Button
                  variant="outline"
                  onClick={handleConvertToSale}
                  disabled={convertToSale.isPending}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Converter em Venda
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.title || createProposal.isPending || updateProposal.isPending}
              >
                {proposal ? 'Atualizar' : 'Criar'} Proposta
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}