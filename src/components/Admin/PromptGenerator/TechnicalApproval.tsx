
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TechnicalAnalysis } from './types';
import { CheckCircle, XCircle, FileText, Database, Zap } from 'lucide-react';

export interface TechnicalApprovalProps {
  analysis: TechnicalAnalysis;
  onApprove: () => void;
  onReject: () => void;
  isProcessing?: boolean;
}

export const TechnicalApproval: React.FC<TechnicalApprovalProps> = ({
  analysis,
  onApprove,
  onReject,
  isProcessing = false
}) => {
  const getImpactColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'clean_code':
        return 'bg-green-100 text-green-800';
      case 'database':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Análise Técnica Concluída</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo da Implementação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Tipo de Impacto</h4>
            <Badge className={getImpactColor(analysis.impactType)}>
              {analysis.impactType}
            </Badge>
          </div>

          <div>
            <h4 className="font-medium mb-2">Descrição</h4>
            <p className="text-sm text-muted-foreground">{analysis.impactDescription}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Justificativa</h4>
            <p className="text-sm text-muted-foreground">{analysis.justification}</p>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Arquivos Afetados</h4>
            <div className="space-y-1">
              {analysis.affectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-3 w-3" />
                  <code className="bg-gray-100 px-1 rounded">{file}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Funções</h4>
              <div className="space-y-1">
                {analysis.estimatedChanges.functions.map((func, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Zap className="h-3 w-3" />
                    <code className="bg-gray-100 px-1 rounded">{func}</code>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tabelas</h4>
              <div className="space-y-1">
                {analysis.estimatedChanges.tables.map((table, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Database className="h-3 w-3" />
                    <code className="bg-gray-100 px-1 rounded">{table}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onReject}
          disabled={isProcessing}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Rejeitar
        </Button>
        <Button
          onClick={onApprove}
          disabled={isProcessing}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isProcessing ? 'Implementando...' : 'Aprovar e Implementar'}
        </Button>
      </div>
    </div>
  );
};
