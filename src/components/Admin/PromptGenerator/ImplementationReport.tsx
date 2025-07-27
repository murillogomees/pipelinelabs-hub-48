
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Database, Settings, FileText, Code, Play } from 'lucide-react';
import { ImplementationReport as IImplementationReport } from './types';

interface ImplementationReportProps {
  report: IImplementationReport;
  onRunBuild: () => void;
  isRunningBuild: boolean;
}

export const ImplementationReport: React.FC<ImplementationReportProps> = ({
  report,
  onRunBuild,
  isRunningBuild
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getBuildStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getBuildStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'failed': return AlertCircle;
      default: return Play;
    }
  };

  const BuildStatusIcon = getBuildStatusIcon(report.buildStatus);

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Implementação Concluída - Relatório Detalhado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">✅ Implementação Finalizada com Sucesso!</h4>
          <p className="text-sm text-gray-700">
            Todas as modificações foram aplicadas seguindo as melhores práticas de desenvolvimento. 
            Confira o relatório detalhado abaixo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Arquivos Modificados ({report.modifiedFiles.length})
            </h5>
            <div className="space-y-1">
              {report.modifiedFiles.map(file => (
                <div key={file} className="flex items-center justify-between text-sm">
                  <span>{file}</span>
                  <Badge variant="outline" className="text-xs">
                    {report.linesChanged[file] || 0} linhas
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Funções Impactadas
            </h5>
            <div className="space-y-2">
              {report.functionsCreated.length > 0 && (
                <div>
                  <span className="text-xs text-green-600 font-medium">CRIADAS:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.functionsCreated.map(func => (
                      <Badge key={func} variant="outline" className="text-xs bg-green-50">
                        {func}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {report.functionsModified.length > 0 && (
                <div>
                  <span className="text-xs text-blue-600 font-medium">MODIFICADAS:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.functionsModified.map(func => (
                      <Badge key={func} variant="outline" className="text-xs bg-blue-50">
                        {func}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {report.functionsRemoved.length > 0 && (
                <div>
                  <span className="text-xs text-red-600 font-medium">REMOVIDAS:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.functionsRemoved.map(func => (
                      <Badge key={func} variant="outline" className="text-xs bg-red-50">
                        {func}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {report.databaseChanges.tables.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Alterações no Banco de Dados
              </h5>
              <div className="space-y-2">
                {report.databaseChanges.tables.map(table => (
                  <div key={table} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {table}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.edgeFunctions.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Edge Functions
              </h5>
              <div className="space-y-2">
                {report.edgeFunctions.map(func => (
                  <div key={func} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {func}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes Técnicos'}
        </Button>

        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h5 className="font-medium">Resumo das Alterações:</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Arquivos totais:</span> {report.modifiedFiles.length}
              </div>
              <div>
                <span className="font-medium">Linhas alteradas:</span> {
                  Object.values(report.linesChanged).reduce((a, b) => a + b, 0)
                }
              </div>
              <div>
                <span className="font-medium">Funções criadas:</span> {report.functionsCreated.length}
              </div>
              <div>
                <span className="font-medium">Funções modificadas:</span> {report.functionsModified.length}
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <h5 className="font-medium flex items-center gap-2">
            <BuildStatusIcon className={`h-4 w-4 ${getBuildStatusColor(report.buildStatus)}`} />
            Status do Build
          </h5>
          
          <div className={`p-4 rounded-lg ${
            report.buildStatus === 'success' ? 'bg-green-50' : 
            report.buildStatus === 'failed' ? 'bg-red-50' : 'bg-yellow-50'
          }`}>
            {report.buildStatus === 'success' && (
              <p className="text-sm text-green-700">
                ✅ Build executado com sucesso! Todas as alterações foram aplicadas corretamente.
              </p>
            )}
            {report.buildStatus === 'failed' && (
              <div className="space-y-2">
                <p className="text-sm text-red-700">
                  ❌ Build falhou. Erros encontrados:
                </p>
                <div className="bg-red-100 p-2 rounded text-xs">
                  {report.buildErrors?.map((error, index) => (
                    <div key={index} className="mb-1">{error}</div>
                  ))}
                </div>
              </div>
            )}
            {report.buildStatus === 'pending' && (
              <p className="text-sm text-yellow-700">
                ⏳ Build ainda não foi executado. Clique no botão abaixo para verificar.
              </p>
            )}
          </div>

          {report.buildStatus !== 'success' && (
            <Button
              onClick={onRunBuild}
              disabled={isRunningBuild}
              className="w-full"
            >
              {isRunningBuild ? 'Executando Build...' : 'Executar Build'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
