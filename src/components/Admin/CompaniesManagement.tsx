import { useState } from 'react';
import { Building2, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useCompanyManager } from '@/hooks/useCompanyManager';
import { CompanyDialog } from './CompanyDialog';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

export function CompaniesManagement() {
  const { companies, isLoading, deleteCompany, refreshCompanies } = useCompanyManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);

  const handleOpenDialog = (company?: Company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCompany(undefined);
  };

  const handleSuccess = () => {
    refreshCompanies();
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await deleteCompany(id);
      toast.success('Empresa excluída com sucesso');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Erro ao excluir empresa');
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.document.includes(searchTerm) ||
    (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    {
      key: 'name',
      header: 'Empresa',
      render: (value: any, company: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{company.name}</div>
            {company.trade_name && (
              <div className="text-sm text-muted-foreground">{company.trade_name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'document',
      header: 'CNPJ/CPF',
      render: (value: any, company: any) => (
        <Badge variant="outline">{company.document}</Badge>
      ),
    },
    {
      key: 'email',
      header: 'Contato',
      render: (value: any, company: any) => (
        <div>
          {company.email && (
            <div className="text-sm">{company.email}</div>
          )}
          {company.phone && (
            <div className="text-sm text-muted-foreground">{company.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Localização',
      render: (value: any, company: any) => (
        <div>
          {company.city && (
            <div className="text-sm">{company.city}</div>
          )}
          {company.zipcode && (
            <div className="text-sm text-muted-foreground">CEP: {company.zipcode}</div>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Criado em',
      render: (value: any, company: any) => (
        <div className="text-sm text-muted-foreground">
          {new Date(company.created_at).toLocaleDateString('pt-BR')}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: 'Editar',
      icon: Edit,
      onClick: (company: Company) => {
        handleOpenDialog(company);
      },
    },
    {
      label: 'Excluir',
      icon: Trash2,
      onClick: (company: Company) => {
        if (window.confirm(`Tem certeza que deseja excluir a empresa "${company.name}"?`)) {
          handleDeleteCompany(company.id);
        }
      },
      variant: 'destructive' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Empresas Cadastradas ({companies.length})
          </CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DataTable
          data={filteredCompanies}
          columns={columns}
          actions={actions}
          loading={isLoading}
          emptyMessage="Nenhuma empresa encontrada"
        />
      </CardContent>

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
        company={selectedCompany}
      />
    </Card>
  );
}