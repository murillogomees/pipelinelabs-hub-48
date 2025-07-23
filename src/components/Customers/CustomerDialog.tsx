import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Customer, NewCustomer } from '@/hooks/useCustomers';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customer: NewCustomer) => void;
  onUpdate: (id: string, updates: Partial<NewCustomer>) => void;
  customer?: Customer;
}

export function CustomerDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  customer
}: CustomerDialogProps) {
  const [formData, setFormData] = useState<NewCustomer>({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    customer_type: 'individual'
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Máscaras para formatação
  const formatCPF = useCallback((value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }, []);

  const formatCNPJ = useCallback((value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }, []);

  const formatPhone = useCallback((value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  }, []);

  const formatCEP = useCallback((value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  }, []);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        document: customer.document || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipcode: customer.zipcode || '',
        customer_type: customer.customer_type
      });
    } else {
      setFormData({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        customer_type: 'individual'
      });
    }
  }, [customer]);

  const validateForm = useCallback(() => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (formData.document) {
      const cleanDoc = formData.document.replace(/\D/g, '');
      if (formData.customer_type === 'individual' && cleanDoc.length !== 11) {
        errors.document = 'CPF deve ter 11 dígitos';
      }
      if (formData.customer_type === 'company' && cleanDoc.length !== 14) {
        errors.document = 'CNPJ deve ter 14 dígitos';
      }
    }
    
    if (formData.email && formData.email.trim() && !formData.email.includes('@')) {
      errors.email = 'E-mail inválido';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof NewCustomer, value: string) => {
    let formattedValue = value;
    
    // Aplicar máscaras conforme o campo
    if (field === 'document') {
      formattedValue = formData.customer_type === 'individual' 
        ? formatCPF(value) 
        : formatCNPJ(value);
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipcode') {
      formattedValue = formatCEP(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro do campo quando usuário digita
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formData.customer_type, formatCPF, formatCNPJ, formatPhone, formatCEP, validationErrors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: "Verifique os campos destacados em vermelho.",
      });
      return;
    }

    if (customer) {
      onUpdate(customer.id, formData);
    } else {
      onSave(formData);
    }
    
    onOpenChange(false);
  };

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                Nome *
                {validationErrors.name && <AlertCircle className="h-4 w-4 text-destructive" />}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do cliente"
                className={validationErrors.name ? 'border-destructive' : ''}
                required
                autoFocus
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_type">Tipo de Cliente</Label>
              <Select
                value={formData.customer_type}
                onValueChange={(value: 'individual' | 'company') => {
                  setFormData(prev => ({ ...prev, customer_type: value, document: '' }));
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.document;
                    return newErrors;
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">
                    <div className="flex items-center gap-2">
                      Pessoa Física
                      <Badge variant="outline" className="text-xs">CPF</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="company">
                    <div className="flex items-center gap-2">
                      Pessoa Jurídica
                      <Badge variant="outline" className="text-xs">CNPJ</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document" className="flex items-center gap-2">
                {formData.customer_type === 'individual' ? 'CPF' : 'CNPJ'}
                {validationErrors.document && <AlertCircle className="h-4 w-4 text-destructive" />}
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                placeholder={formData.customer_type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
                className={validationErrors.document ? 'border-destructive' : ''}
              />
              {validationErrors.document && (
                <p className="text-sm text-destructive">{validationErrors.document}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              E-mail
              {validationErrors.email && <AlertCircle className="h-4 w-4 text-destructive" />}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="cliente@email.com"
              className={validationErrors.email ? 'border-destructive' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleInputChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipcode">CEP</Label>
              <Input
                id="zipcode"
                value={formData.zipcode}
                onChange={(e) => handleInputChange('zipcode', e.target.value)}
                placeholder="00000-000"
              />
            </div>
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
              {customer ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}