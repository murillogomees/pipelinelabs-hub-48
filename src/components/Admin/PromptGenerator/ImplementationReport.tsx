
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ImplementationReport as IImplementationReport } from './types';
import { FileText, Code, Database, Zap, ArrowRight } from 'lucide-react';

export interface ImplementationReportProps {
  report: IImplementationReport;
  onNext: () => void;
}

export const ImplementationReport: React.FC<ImplementationReportProps> = ({
  report,
  onNext
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalLines = Object.values(report.linesChanged).reduce((sum, lines) => sum + (lines || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Code className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Relatório de Implementação</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status da Implementação</span>
            <Badge className={getStatusColor(report.buildStatus)}>
              {report.buildStatus}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.buildStatus === 'running' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processando...</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{report.modifiedFiles.length}</div>
              <div className="text-sm text-muted-foreground">Arquivos Modificados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalLines}</div>
              <div className="text-sm text-muted-foreground">Linhas Alteradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{report.functionsCreated.length}</div>
              <div className="text-sm text-muted-foreground">Funções Criadas</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Arquivos Modificados
              </h4>
              <div className="space-y-1">
                {report.modifiedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">{file}</code>
                    <Badge variant="outline">
                      {report.linesChanged[file] || 0} linhas
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {report.functionsCreated.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Funções Criadas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {report.functionsCreated.map((func, index) => (
                    <Badge key={index} variant="secondary">{func}</Badge>
                  ))}
                </div>
              </div>
            )}

            {report.databaseChanges.tables.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Alterações no Banco de Dados
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Tabelas: </span>
                    <span className="text-sm">{report.databaseChanges.tables.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Campos: </span>
                    <span className="text-sm">{report.databaseChanges.fields.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={report.buildStatus === 'running'}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Continuar para Verificação
        </Button>
      </div>
    </div>
  );
};
