
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code, 
  Play, 
  RotateCcw, 
  FileText, 
  Database, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export interface CodePreviewProps {
  generatedCode: any;
  logId?: string;
  onApply: (logId: string) => void;
  isApplying: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  generatedCode,
  logId,
  onApply,
  isApplying
}) => {
  if (!generatedCode) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum código gerado ainda</p>
            <p className="text-xs">Gere código para ver a prévia aqui</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleApply = () => {
    if (logId) {
      onApply(logId);
    }
  };

  // Melhor validação dos dados
  const hasFiles = generatedCode?.files && typeof generatedCode.files === 'object' && Object.keys(generatedCode.files).length > 0;
  const hasSql = generatedCode?.sql && Array.isArray(generatedCode.sql) && generatedCode.sql.length > 0;
  const hasDescription = generatedCode?.description && typeof generatedCode.description === 'string';
  const hasSuggestions = generatedCode?.suggestions && Array.isArray(generatedCode.suggestions) && generatedCode.suggestions.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Prévia do Código Gerado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {hasDescription && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Descrição</h4>
            <p className="text-sm text-muted-foreground">{generatedCode.description}</p>
          </div>
        )}

        {/* Debug info se necessário */}
        {generatedCode?.parseError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-sm mb-2 text-red-800">Erro de Parse</h4>
            <p className="text-sm text-red-600">{generatedCode.parseError}</p>
            {generatedCode?.rawContent && (
              <details className="mt-2">
                <summary className="text-sm font-medium text-red-700 cursor-pointer">Ver conteúdo bruto</summary>
                <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                  {generatedCode.rawContent}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Files */}
        {hasFiles && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-sm">Arquivos ({Object.keys(generatedCode.files).length})</span>
            </div>
            <div className="space-y-2">
              {Object.entries(generatedCode.files).map(([filePath, fileContent]) => (
                <div key={filePath} className="border rounded-lg">
                  <div className="px-3 py-2 bg-muted text-sm font-mono border-b">
                    {filePath}
                  </div>
                  <ScrollArea className="h-40 p-3">
                    <pre className="text-xs whitespace-pre-wrap">
                      {String(fileContent)}
                    </pre>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SQL Commands */}
        {hasSql && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium text-sm">Comandos SQL ({generatedCode.sql.length})</span>
            </div>
            <div className="space-y-2">
              {generatedCode.sql.map((sqlCommand: string, index: number) => (
                <div key={index} className="border rounded-lg">
                  <div className="px-3 py-2 bg-muted text-sm font-mono border-b">
                    SQL Command {index + 1}
                  </div>
                  <ScrollArea className="h-32 p-3">
                    <pre className="text-xs whitespace-pre-wrap">
                      {sqlCommand}
                    </pre>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {hasSuggestions && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium text-sm">Sugestões</span>
            </div>
            <div className="space-y-2">
              {generatedCode.suggestions.map((suggestion: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={suggestion.type === 'improvement' ? 'default' : 'secondary'}>
                      {suggestion.type === 'improvement' ? 'Melhoria' : 'Sugestão'}
                    </Badge>
                    <span className="text-sm font-medium">{suggestion.title || 'Sugestão'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.description || 'Sem descrição'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações técnicas extras */}
        {!hasFiles && !hasSql && !hasDescription && !hasSuggestions && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-sm text-yellow-800">Dados Incompletos</span>
            </div>
            <p className="text-sm text-yellow-700">
              O código foi gerado mas os dados podem estar em formato inesperado.
            </p>
            {generatedCode && (
              <details className="mt-2">
                <summary className="text-sm font-medium text-yellow-700 cursor-pointer">Ver dados brutos</summary>
                <pre className="text-xs mt-2 p-2 bg-yellow-100 rounded overflow-auto max-h-32">
                  {JSON.stringify(generatedCode, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={handleApply}
            disabled={isApplying || !logId}
            className="flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Aplicando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Aplicar Código
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
