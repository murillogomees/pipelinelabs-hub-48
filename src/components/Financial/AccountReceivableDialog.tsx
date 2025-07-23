import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AccountReceivable, NewAccountReceivable } from '@/hooks/useAccountsReceivable';
import { FINANCIAL_CATEGORIES, FINANCIAL_MESSAGES } from './constants';
import { validateAccountData } from './utils';

interface AccountReceivableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: NewAccountReceivable) => void;
  onUpdate: (id: string, updates: Partial<NewAccountReceivable>) => void;
  account?: AccountReceivable;
}

interface Customer {
  id: string;
  name: string;
}

export function AccountReceivableDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  account
}: AccountReceivableDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<NewAccountReceivable>({
    description: '',
    amount: 0,
    due_date: '',
    payment_method: '',
    notes: '',
    customer_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (account) {
      setFormData({
        description: account.description,
        amount: account.amount,
        due_date: account.due_date,
        payment_method: account.payment_method || '',
        notes: account.notes || '',
        customer_id: account.customer_id || ''
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        due_date: '',
        payment_method: '',
        notes: '',
        customer_id: ''
      });
    }
  }, [account]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, name')
        .eq('is_active', true);
      
      setCustomers(data || []);
    };

    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateAccountData(formData);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: FINANCIAL_MESSAGES.ERROR.REQUIRED_FIELDS,
      });
      return;
    }

    const accountData = {
      ...formData,
      customer_id: formData.customer_id || undefined,
      payment_method: formData.payment_method || undefined
    };

    if (account) {
      onUpdate(account.id, accountData);
    } else {
      onSave(accountData);
    }
    
    onOpenChange(false);
  };

  const paymentMethods = FINANCIAL_CATEGORIES.PAYMENT_METHODS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da conta"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
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

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {account ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}