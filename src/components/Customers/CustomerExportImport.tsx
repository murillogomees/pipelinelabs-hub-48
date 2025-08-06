import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/hooks/useCustomers';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface CustomerExportImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
}

export function CustomerExportImport({ open, onOpenChange, customers }: CustomerExportImportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Exportar clientes para CSV
  const exportToCSV = () => {
    try {
      const headers = [
        'Nome',
        'Tipo',
        'CPF/CNPJ',
        'Email',
        'Telefone',
        'Endereço',
        'Cidade',
        'Estado',
        'CEP',
        'Status',
        'Data de Criação'
      ];

      const csvContent = [
        headers.join(','),
        ...customers.map(customer => [
          `"${customer.name}"`,
          customer.customer_type === 'individual' ? 'Pessoa Física' : 'Pessoa Jurídica',
          `"${customer.document || ''}"`,
          `"${customer.email || ''}"`,
          `"${customer.phone || ''}"`,
          `"${customer.address || ''}"`,
          `"${customer.city || ''}"`,
          `"${customer.state || ''}"`,
          `"${customer.zipcode || ''}"`,
          customer.is_active ? 'Ativo' : 'Inativo',
          new Date(customer.created_at).toLocaleDateString('pt-BR')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação realizada",
        description: `${customers.length} clientes exportados com sucesso.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível exportar os clientes.",
      });
    }
  };

  // Template CSV para download
  const downloadTemplate = () => {
    const headers = [
      'nome',
      'tipo_cliente',
      'documento',
      'email',
      'telefone',
      'endereco',
      'cidade',
      'estado',
      'cep'
    ];

    const example = [
      'João Silva',
      'individual',
      '123.456.789-00',
      'joao@email.com',
      '(11) 99999-9999',
      'Rua das Flores, 123',
      'São Paulo',
      'SP',
      '01234-567'
    ];

    const csvContent = [
      headers.join(','),
      example.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_clientes.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Template baixado",
      description: "Use este arquivo como modelo para importação.",
    });
  };

  // Processar importação (simulação - em produção seria conectado ao backend)
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV.",
      });
      return;
    }

    setImportLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Validar headers
      const requiredHeaders = ['nome', 'tipo_cliente'];
      const hasRequiredHeaders = requiredHeaders.every(header => 
        headers.some(h => h.toLowerCase().trim() === header)
      );

      if (!hasRequiredHeaders) {
        throw new Error('Arquivo CSV deve conter pelo menos as colunas: nome, tipo_cliente');
      }

      const dataRows = lines.slice(1).filter(line => line.trim());
      
      toast({
        title: "Importação simulada",
        description: `${dataRows.length} registros foram processados. Em produção, os clientes seriam criados no sistema.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error importing customers:', error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Não foi possível processar o arquivo.",
      });
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Exportar / Importar Clientes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exportação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Clientes
              </CardTitle>
              <CardDescription>
                Baixe todos os seus clientes em formato CSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button onClick={exportToCSV} disabled={customers.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Importação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importar Clientes
              </CardTitle>
              <CardDescription>
                Importe clientes a partir de um arquivo CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Arquivo CSV</Label>
                <Input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  disabled={importLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadTemplate}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Baixar Template
                </Button>
                
                {importLoading && (
                  <Badge variant="secondary" className="animate-pulse">
                    Processando...
                  </Badge>
                )}
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Instruções para importação:</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Use o template fornecido como base</li>
                      <li>Campos obrigatórios: nome, tipo_cliente</li>
                      <li>Tipo de cliente: "individual" ou "company"</li>
                      <li>Máximo de 1000 registros por importação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}