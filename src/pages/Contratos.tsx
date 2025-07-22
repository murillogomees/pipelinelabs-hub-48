import { useState } from "react";
import { MainLayout } from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useContracts } from "@/hooks/useContracts";
import { ContractDialog } from "@/components/Contracts/ContractDialog";
import { formatCurrency } from "@/lib/utils";

export default function Contratos() {
  const { contracts, isLoading, createContract, updateContract, deleteContract } = useContracts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
      renewed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Rascunho',
      active: 'Ativo',
      expired: 'Expirado',
      terminated: 'Cancelado',
      renewed: 'Renovado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    return type === 'cliente' ? 'Cliente' : 'Fornecedor';
  };

  // Filter valid contracts and calculate statistics
  const validContracts = (contracts || []).filter((c: any) => c && c.id) as any[];
  
  const stats = {
    total: validContracts.length,
    active: validContracts.filter(c => c.status === 'active').length,
    expiring: validContracts.filter(c => {
      const endDate = new Date(c.end_date);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      return endDate >= now && endDate <= thirtyDaysFromNow;
    }).length,
    totalValue: validContracts.reduce((sum, c) => sum + (c.contract_value || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-mobile">
      <div className="flex-mobile gap-mobile items-center">
        <div className="flex-1">
          <h1 className="heading-mobile font-bold">Gestão de Contratos</h1>
          <p className="text-mobile text-muted-foreground">Gerencie contratos com clientes e fornecedores</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="btn-mobile">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Novo Contrato</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-mobile">
        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirando em 30 dias</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.expiring}</div>
          </CardContent>
        </Card>
        
        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contratos */}
      <Card className="card-mobile">
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="table-mobile">
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead className="hidden sm:table-cell">Título</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden lg:table-cell">Cliente/Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Início</TableHead>
                  <TableHead className="hidden md:table-cell">Término</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden sm:table-cell">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validContracts.map((contract: any) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      {contract.contract_number}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div>
                        <div className="font-medium">{contract.title}</div>
                        {contract.description && (
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {contract.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">
                        {getTypeLabel(contract.contract_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {contract.contract_type === 'cliente' ? 'Cliente' : 'Fornecedor'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contract.status)}>
                        {getStatusLabel(contract.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(contract.start_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                        {(() => {
                          const endDate = new Date(contract.end_date);
                          const now = new Date();
                          const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
                          return endDate >= now && endDate <= thirtyDaysFromNow ? (
                            <AlertCircle className="h-4 w-4 ml-1 text-orange-500" />
                          ) : null;
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(contract.contract_value)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContract(contract);
                          setDialogOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!validContracts.length && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum contrato encontrado</h3>
                <p className="mb-4">Crie seu primeiro contrato para começar a gerenciar</p>
                <Button onClick={() => setDialogOpen(true)} className="btn-mobile">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ContractDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedContract(null);
        }}
        onSubmit={(data) => {
          if (selectedContract) {
            updateContract({ id: selectedContract.id, data });
          } else {
            createContract(data);
          }
        }}
        initialData={selectedContract}
      />
    </div>
  );
}