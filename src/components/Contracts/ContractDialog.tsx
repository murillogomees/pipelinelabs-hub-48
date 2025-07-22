import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { useSuppliers } from "@/hooks/useSuppliers";
import { ContractFormData, Contract } from "@/hooks/useContracts";

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ContractFormData) => void;
  initialData?: Contract;
}

const contractTypes = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'fornecedor', label: 'Fornecedor' },
];

const statusOptions = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativo' },
  { value: 'expired', label: 'Expirado' },
  { value: 'terminated', label: 'Cancelado' },
  { value: 'renewed', label: 'Renovado' },
];

const currencyOptions = [
  { value: 'BRL', label: 'Real (BRL)' },
  { value: 'USD', label: 'Dólar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
];

export function ContractDialog({ open, onOpenChange, onSubmit, initialData }: ContractDialogProps) {
  const { customers } = useCustomers();
  const { suppliers } = useSuppliers();

  const [formData, setFormData] = useState<ContractFormData>({
    title: '',
    description: '',
    contract_type: '',
    customer_id: '',
    supplier_id: '',
    start_date: '',
    end_date: '',
    renewal_date: '',
    signature_date: '',
    contract_value: 0,
    currency: 'BRL',
    status: 'draft',
    auto_renewal: false,
    renewal_period: 12,
    document_url: '',
    observations: '',
    renewal_terms: '',
    termination_clause: '',
    notification_days: 30,
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        contract_type: initialData.contract_type,
        customer_id: initialData.customer_id || '',
        supplier_id: initialData.supplier_id || '',
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        renewal_date: initialData.renewal_date || '',
        signature_date: initialData.signature_date || '',
        contract_value: initialData.contract_value,
        currency: initialData.currency,
        status: initialData.status,
        auto_renewal: initialData.auto_renewal,
        renewal_period: initialData.renewal_period,
        document_url: initialData.document_url || '',
        observations: initialData.observations || '',
        renewal_terms: initialData.renewal_terms || '',
        termination_clause: initialData.termination_clause || '',
        notification_days: initialData.notification_days,
      });
    } else if (!open) {
      setFormData({
        title: '',
        description: '',
        contract_type: '',
        customer_id: '',
        supplier_id: '',
        start_date: '',
        end_date: '',
        renewal_date: '',
        signature_date: '',
        contract_value: 0,
        currency: 'BRL',
        status: 'draft',
        auto_renewal: false,
        renewal_period: 12,
        document_url: '',
        observations: '',
        renewal_terms: '',
        termination_clause: '',
        notification_days: 30,
      });
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título do contrato"
                required
              />
            </div>
            <div>
              <Label htmlFor="contract_type">Tipo de Contrato *</Label>
              <SearchableSelect
                value={formData.contract_type}
                onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                placeholder="Selecione o tipo"
                staticOptions={contractTypes}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do contrato"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.contract_type === 'cliente' && (
              <div>
                <Label htmlFor="customer_id">Cliente</Label>
                <SearchableSelect
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  placeholder="Selecione um cliente"
                  staticOptions={customers?.map(customer => ({
                    value: customer.id,
                    label: customer.name
                  })) || []}
                />
              </div>
            )}
            
            {formData.contract_type === 'fornecedor' && (
              <div>
                <Label htmlFor="supplier_id">Fornecedor</Label>
                <SearchableSelect
                  value={formData.supplier_id}
                  onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                  placeholder="Selecione um fornecedor"
                  staticOptions={suppliers?.map(supplier => ({
                    value: supplier.id,
                    label: supplier.name
                  })) || []}
                />
              </div>
            )}

            <div>
              <Label htmlFor="status">Status</Label>
              <SearchableSelect
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                placeholder="Selecione o status"
                staticOptions={statusOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data de Término *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="renewal_date">Data de Renovação</Label>
              <Input
                id="renewal_date"
                type="date"
                value={formData.renewal_date}
                onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="signature_date">Data de Assinatura</Label>
              <Input
                id="signature_date"
                type="date"
                value={formData.signature_date}
                onChange={(e) => setFormData({ ...formData, signature_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contract_value">Valor do Contrato</Label>
              <Input
                id="contract_value"
                type="number"
                step="0.01"
                value={formData.contract_value}
                onChange={(e) => setFormData({ ...formData, contract_value: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <SearchableSelect
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                staticOptions={currencyOptions}
              />
            </div>
            <div>
              <Label htmlFor="renewal_period">Período de Renovação (meses)</Label>
              <Input
                id="renewal_period"
                type="number"
                value={formData.renewal_period}
                onChange={(e) => setFormData({ ...formData, renewal_period: parseInt(e.target.value) || 12 })}
                placeholder="12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notification_days">Dias para Notificação</Label>
              <Input
                id="notification_days"
                type="number"
                value={formData.notification_days}
                onChange={(e) => setFormData({ ...formData, notification_days: parseInt(e.target.value) || 30 })}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="document_url">URL do Documento</Label>
              <Input
                id="document_url"
                type="url"
                value={formData.document_url}
                onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto_renewal"
              checked={formData.auto_renewal}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_renewal: checked })}
            />
            <Label htmlFor="auto_renewal">Renovação Automática</Label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Observações gerais"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="renewal_terms">Termos de Renovação</Label>
              <Textarea
                id="renewal_terms"
                value={formData.renewal_terms}
                onChange={(e) => setFormData({ ...formData, renewal_terms: e.target.value })}
                placeholder="Termos para renovação"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="termination_clause">Cláusula de Rescisão</Label>
              <Textarea
                id="termination_clause"
                value={formData.termination_clause}
                onChange={(e) => setFormData({ ...formData, termination_clause: e.target.value })}
                placeholder="Cláusula de rescisão"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Atualizar' : 'Criar'} Contrato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}