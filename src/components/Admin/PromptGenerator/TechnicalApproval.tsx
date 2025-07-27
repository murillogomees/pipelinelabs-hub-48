
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Database, Shield, Zap, Code, FileText, Settings } from 'lucide-react';
import { TechnicalAnalysis } from './types';

interface TechnicalApprovalProps {
  analysis: TechnicalAnalysis;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

const impactIcons = {
  performance: Zap,
  security: Shield,
  clean_code: Code,
  database: Database,
  architecture: Settings
};

const impactColors = {
  performance: 'text-green-500',
  security: 'text-red-500',
  clean_code: 'text-blue-500',
  database: 'text-purple-500',
  architecture: 'text-orange-500'
};

export const TechnicalApproval: React.FC<TechnicalApprovalProps> = ({
  analysis,
  onApprove,
  onReject,
  isProcessing
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const IconComponent = impactIcons[analysis.impactType];

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Aprovação Técnica - Revisão Detalhada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <IconComponent className={`h-4 w-4 ${impactColors[analysis.impactType]}`} />
            Análise Técnica Concluída
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Impacto:</strong> {analysis.impactDescription}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Justificativa:</strong> {analysis.justification}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Arquivos que serão modificados
            </h5>
            <div className="space-y-1">
              {analysis.estimatedChanges.files.map(file => (
                <div key={file} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {file}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Funções impactadas
            </h5>
            <div className="space-y-1">
              {analysis.estimatedChanges.functions.map(func => (
                <div key={func} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {func}()
                </div>
              ))}
            </div>
          </div>

          {analysis.estimatedChanges.tables.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Tabelas do banco afetadas
              </h5>
              <div className="space-y-1">
                {analysis.estimatedChanges.tables.map(table => (
                  <div key={table} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {table}
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.estimatedChanges.edgeFunctions.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Edge Functions
              </h5>
              <div className="space-y-1">
                {analysis.estimatedChanges.edgeFunctions.map(func => (
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
            <h5 className="font-medium">Critérios de Otimização Aplicados:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Otimização de performance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Código limpo e legível</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Segurança aprimorada</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Boas práticas arquiteturais</span>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">
            <strong>Resumo:</strong> A implementação seguirá os melhores padrões de desenvolvimento, 
            mantendo a compatibilidade com o código existente e otimizando performance. 
            Todas as alterações serão testadas automaticamente.
          </p>
          <p className="text-sm text-gray-600">
            Clique em "Aprovar e Implementar" para continuar ou "Revisar Comando" para fazer ajustes.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Implementando...' : 'Aprovar e Implementar'}
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            disabled={isProcessing}
            className="flex-1"
          >
            Revisar Comando
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
