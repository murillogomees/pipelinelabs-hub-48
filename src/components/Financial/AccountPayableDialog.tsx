import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AccountPayable, NewAccountPayable } from '@/hooks/useAccountsPayable';

interface AccountPayableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: NewAccountPayable) => void;
  onUpdate: (id: string, updates: Partial<NewAccountPayable>) => void;
  account?: AccountPayable;
}

interface Supplier {
  id: string;
  name: string;
}

export function AccountPayableDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  account
}: AccountPayableDialogProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<NewAccountPayable>({
    description: '',
    amount: 0,
    due_date: '',
    category: '',
    notes: '',
    supplier_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (account) {
      setFormData({
        description: account.description,
        amount: account.amount,
        due_date: account.due_date,
        category: account.category || '',
        notes: account.notes || '',
        supplier_id: account.supplier_id || ''
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        due_date: '',
        category: '',
        notes: '',
        supplier_id: ''
      });
    }
  }, [account]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true);
      
      setSuppliers(data || []);
    };

    if (open) {
      fetchSuppliers();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || formData.amount <= 0 || !formData.due_date) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    const accountData = {
      ...formData,
      supplier_id: formData.supplier_id || undefined
    };

    if (account) {
      onUpdate(account.id, accountData);
    } else {
      onSave(accountData);
    }
    
    onOpenChange(false);
  };

  const categories = [
    'Fornecedores',
    'Serviços',
    'Impostos',
    'Aluguel',
    'Energia',
    'Telefone',
    'Internet',
    'Combustível',
    'Material de Escritório',
    'Marketing',
    'Outros'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
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
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
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