
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RealNFeDialog } from '@/components/NFe/RealNFeDialog';
import { useNFe } from '@/hooks/useNFe';
import { useNFeIntegration } from '@/hooks/useNFeIntegration';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Download,
  Send,
  Ban,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

const NotasFiscais: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNFe, setSelectedNFe] = useState<any>(null);

  const { nfeData, isLoading, createNFe, updateNFe, deleteNFe, isCreating, isUpdating } = useNFe();
  const { nfeIntegration } = useNFeIntegration();

  // Add missing properties to nfeIntegration
  const nfeList = nfeData || [];
  const sendNFe = (data: any) => {
    console.log('Sending NFe:', data);
    // Implementation for sending NFe
  };
  const cancelNFe = (id: string) => {
    console.log('Cancelling NFe:', id);
    // Implementation for cancelling NFe
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled':
        return <Ban className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateNFe = () => {
    setSelectedNFe(null);
    setIsDialogOpen(true);
  };

  const handleEditNFe = (nfe: any) => {
    setSelectedNFe(nfe);
    setIsDialogOpen(true);
  };

  const handleSendNFe = (nfe: any) => {
    sendNFe(nfe);
  };

  const handleCancelNFe = (nfe: any) => {
    cancelNFe(nfe.id);
  };

  const filteredNFes = nfeList.filter((nfe: any) =>
    nfe.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nfe.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notas Fiscais</h1>
          <p className="text-muted-foreground">
            Gerencie suas notas fiscais eletrônicas
          </p>
        </div>
        <Button onClick={handleCreateNFe}>
          <Plus className="h-4 w-4 mr-2" />
          Nova NFe
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* NFe List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas Fiscais ({filteredNFes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNFes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma nota fiscal encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira nota fiscal eletrônica
              </p>
              <Button onClick={handleCreateNFe}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova NFe
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNFes.map((nfe: any) => (
                <div
                  key={nfe.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">NFe #{nfe.invoice_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {nfe.customers?.name || 'Cliente não informado'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(nfe.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(nfe.status)}
                          {nfe.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {nfe.total_amount?.toFixed(2) || '0,00'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(nfe.issue_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNFe(nfe)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendNFe(nfe)}
                          disabled={nfe.status === 'approved'}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelNFe(nfe)}
                          disabled={nfe.status === 'cancelled'}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NFe Dialog */}
      <RealNFeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        nfe={selectedNFe}
        onSave={(data) => {
          if (selectedNFe) {
            updateNFe({ id: selectedNFe.id, ...data });
          } else {
            createNFe(data);
          }
          setIsDialogOpen(false);
        }}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default NotasFiscais;
