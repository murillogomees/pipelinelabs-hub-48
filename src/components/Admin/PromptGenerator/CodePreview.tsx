
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

  const hasFiles = generatedCode.files && Object.keys(generatedCode.files).length > 0;
  const hasSql = generatedCode.sql && generatedCode.sql.length > 0;

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
        {generatedCode.description && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Descrição</h4>
            <p className="text-sm text-muted-foreground">{generatedCode.description}</p>
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
        {generatedCode.suggestions && generatedCode.suggestions.length > 0 && (
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
                    <span className="text-sm font-medium">{suggestion.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
              ))}
            </div>
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
