import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Receipt, Building, Send, X, Download } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNFe } from '@/hooks/useNFe';
import { RealNFeDialog } from '@/components/NFe/RealNFeDialog';

// Componente para NFe
function NFe() {
  const { nfeList, isLoading, sendNFe, cancelNFe } = useNFe();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const getStatusBadge = (nfe: any) => {
    const status = nfe.nfe_xmls?.[0]?.status || 'draft';
    const variants = {
      draft: 'secondary',
      sent: 'outline',
      authorized: 'default',
      canceled: 'destructive',
      rejected: 'destructive',
    } as const;

    const labels = {
      draft: 'Rascunho',
      sent: 'Enviada',
      authorized: 'Autorizada',
      canceled: 'Cancelada',
      rejected: 'Rejeitada',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NFe - Nota Fiscal Eletrônica</h2>
          <p className="text-muted-foreground">Emita notas fiscais eletrônicas</p>
        </div>
        <RealNFeDialog 
          trigger={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova NFe
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : nfeList.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Nenhuma NFe encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nfeList.map((nfe: any) => (
                <div key={nfe.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">NFe #{nfe.invoice_number}</span>
                        {getStatusBadge(nfe)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Série: {nfe.series} | Data: {formatDate(nfe.issue_date)}
                      </p>
                      {nfe.customers && (
                        <p className="text-sm">
                          Cliente: {nfe.customers.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">{formatCurrency(nfe.total_amount)}</p>
                      <div className="flex gap-2">
                        {nfe.nfe_xmls?.[0]?.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendNFe.mutate(nfe.id)}
                            disabled={sendNFe.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                        {(nfe.nfe_xmls?.[0]?.status === 'authorized' || nfe.nfe_xmls?.[0]?.status === 'sent') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelNFe.mutate(nfe.id)}
                            disabled={cancelNFe.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {nfe.nfe_xmls?.[0]?.pdf_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(nfe.nfe_xmls[0].pdf_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {nfe.nfe_xmls?.[0]?.access_key && (
                    <div className="text-xs text-muted-foreground">
                      Chave: {nfe.nfe_xmls[0].access_key}
                    </div>
                  )}
                  
                  {nfe.nfe_xmls?.[0]?.rejection_reason && (
                    <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      Motivo da rejeição: {nfe.nfe_xmls[0].rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

// Componente para NFCe
function NFCe() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NFCe - Nota Fiscal do Consumidor</h2>
          <p className="text-muted-foreground">Emita cupons fiscais eletrônicos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova NFCe
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">NFCe em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de emissão de NFCe estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para NFSe
function NFSe() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NFSe - Nota Fiscal de Serviços</h2>
          <p className="text-muted-foreground">Emita notas fiscais de serviços</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Nova NFSe
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">NFSe em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O módulo de emissão de NFSe estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal Notas Fiscais
export function NotasFiscais() {
  const location = useLocation();
  
  // Determina a aba ativa baseada na URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/nfe')) return 'nfe';
    if (path.includes('/nfce')) return 'nfce';
    if (path.includes('/nfse')) return 'nfse';
    return 'nfe'; // padrão
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notas Fiscais</h1>
        <p className="text-muted-foreground">Emita e gerencie notas fiscais</p>
      </div>

      <Tabs value={getActiveTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nfe" asChild>
            <NavLink to="/notas-fiscais/nfe" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>NFe</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="nfce" asChild>
            <NavLink to="/notas-fiscais/nfce" className="flex items-center space-x-2">
              <Receipt className="w-4 h-4" />
              <span>NFCe</span>
            </NavLink>
          </TabsTrigger>
          <TabsTrigger value="nfse" asChild>
            <NavLink to="/notas-fiscais/nfse" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>NFSe</span>
            </NavLink>
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route index element={<NFe />} />
          <Route path="nfe" element={<NFe />} />
          <Route path="nfce" element={<NFCe />} />
          <Route path="nfse" element={<NFSe />} />
        </Routes>
      </Tabs>
    </div>
  );
}