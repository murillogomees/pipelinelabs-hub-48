import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useCompanyManager } from '@/hooks/useCompanyManager';

interface Company {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  legal_name?: string;
  trade_name?: string;
  tax_regime?: string;
  state_registration?: string;
  municipal_registration?: string;
  legal_representative?: string;
  fiscal_email?: string;
}

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  company?: Company;
}

export function CompanyDialog({ open, onOpenChange, onSuccess, company }: CompanyDialogProps) {
  const { toast } = useToast();
  const { createCompany, updateCompany, isLoading: companyLoading } = useCompanyManager();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company?.name || '',
    trade_name: company?.trade_name || '',
    document: company?.document || '',
    email: company?.email || '',
    phone: company?.phone || '',
    address: company?.address || '',
    city: company?.city || '',
    zipcode: company?.zipcode || '',
    tax_regime: company?.tax_regime || 'simples_nacional',
    legal_name: company?.legal_name || '',
    state_registration: company?.state_registration || '',
    municipal_registration: company?.municipal_registration || '',
    legal_representative: company?.legal_representative || '',
    fiscal_email: company?.fiscal_email || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Nome da empresa é obrigatório.",
      });
      return false;
    }
    
    if (!formData.document.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de validação", 
        description: "CNPJ/CPF é obrigatório.",
      });
      return false;
    }

    // Validar formato do CNPJ/CPF
    const cleanDocument = formData.document.replace(/[^0-9]/g, '');
    if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "CNPJ deve ter 14 dígitos ou CPF deve ter 11 dígitos.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        document: formData.document.replace(/[^0-9]/g, ''), // Remove formatação
      };

      if (company) {
        // Editar empresa existente
        await updateCompany(company.id, dataToSubmit);
      } else {
        // Criar nova empresa
        await createCompany(dataToSubmit);
      }

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      if (!company) {
        setFormData({
          name: '',
          trade_name: '',
          document: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          zipcode: '',
          tax_regime: 'simples_nacional',
          legal_name: '',
          state_registration: '',
          municipal_registration: '',
          legal_representative: '',
          fiscal_email: '',
        });
      }
    } catch (error: any) {
      console.error('Error saving company:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDocument = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value);
    handleInputChange('document', formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
          <DialogDescription>
            {company 
              ? 'Edite as informações da empresa abaixo.'
              : 'Preencha as informações para criar uma nova empresa.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome fantasia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal_name">Razão Social</Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => handleInputChange('legal_name', e.target.value)}
                placeholder="Razão social completa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_name">Nome Comercial</Label>
              <Input
                id="trade_name"
                value={formData.trade_name}
                onChange={(e) => handleInputChange('trade_name', e.target.value)}
                placeholder="Nome comercial"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CNPJ/CPF *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleDocumentChange(e.target.value)}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="empresa@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_email">E-mail Fiscal</Label>
              <Input
                id="fiscal_email"
                type="email"
                value={formData.fiscal_email}
                onChange={(e) => handleInputChange('fiscal_email', e.target.value)}
                placeholder="fiscal@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_regime">Regime Tributário</Label>
              <Select
                value={formData.tax_regime}
                onValueChange={(value) => handleInputChange('tax_regime', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                  <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="lucro_real">Lucro Real</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state_registration">Inscrição Estadual</Label>
              <Input
                id="state_registration"
                value={formData.state_registration}
                onChange={(e) => handleInputChange('state_registration', e.target.value)}
                placeholder="000.000.000.000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipal_registration">Inscrição Municipal</Label>
              <Input
                id="municipal_registration"
                value={formData.municipal_registration}
                onChange={(e) => handleInputChange('municipal_registration', e.target.value)}
                placeholder="000000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal_representative">Representante Legal</Label>
              <Input
                id="legal_representative"
                value={formData.legal_representative}
                onChange={(e) => handleInputChange('legal_representative', e.target.value)}
                placeholder="Nome do responsável legal"
              />
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

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="São Paulo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Rua, número, bairro..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {company ? 'Atualizar' : 'Criar'} Empresa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}