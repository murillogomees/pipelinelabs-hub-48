
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Brain, FileCode, Zap } from 'lucide-react';
import { TechnicalAnalysis } from './types';

interface InitialQueryProps {
  prompt: string;
  onAnalysisComplete: (analysis: TechnicalAnalysis) => void;
  isAnalyzing: boolean;
}

export const InitialQuery: React.FC<InitialQueryProps> = ({
  prompt,
  onAnalysisComplete,
  isAnalyzing
}) => {
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);

  const performInitialAnalysis = useCallback(() => {
    // Simular análise técnica baseada no prompt
    const mockAnalysis: TechnicalAnalysis = {
      affectedFiles: [
        'src/components/Products/ProductDialog.tsx',
        'src/hooks/useProducts.ts',
        'src/components/Products/schema.ts'
      ],
      impactType: 'performance',
      impactDescription: 'Otimização da interface de produtos com validação aprimorada',
      justification: 'Melhoria na experiência do usuário e redução de re-renders desnecessários',
      estimatedChanges: {
        files: ['ProductDialog.tsx', 'useProducts.ts', 'schema.ts'],
        functions: ['handleProductSubmit', 'validateProduct', 'optimizeProductQuery'],
        tables: ['products'],
        edgeFunctions: ['product-validation']
      }
    };

    setAnalysis(mockAnalysis);
    onAnalysisComplete(mockAnalysis);
  }, [onAnalysisComplete]);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          Consulta Inicial - Interpretação do Comando
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Comando recebido:</h4>
          <p className="text-sm text-gray-700 italic">"{prompt}"</p>
        </div>

        {!analysis && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Analisando comando e identificando impactos...</span>
            </div>
            <Button
              onClick={performInitialAnalysis}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analisando...' : 'Iniciar Análise Técnica'}
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                Análise Inicial Concluída
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                Legal! Vamos executar: <strong>{prompt}</strong>
              </p>
              <p className="text-sm text-gray-700 mb-3">
                Pelo que entendi, isso afeta os arquivos <strong>{analysis.affectedFiles.join(', ')}</strong> e 
                tem impacto direto na funcionalidade <strong>{analysis.impactDescription}</strong>.
              </p>
              <p className="text-sm text-gray-700">
                Já estou verificando o que precisa ser feito para otimizar performance e manter o padrão do projeto. 
                Te aviso na próxima etapa 😉
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Arquivos Afetados
                </h5>
                <div className="flex flex-wrap gap-1">
                  {analysis.affectedFiles.map(file => (
                    <Badge key={file} variant="outline" className="text-xs">
                      {file.split('/').pop()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">Tipo de Impacto</h5>
                <Badge variant="secondary" className="capitalize">
                  {analysis.impactType}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
