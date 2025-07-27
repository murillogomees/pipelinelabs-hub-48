
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Play, FileText, Database } from 'lucide-react';

export interface CodePreviewProps {
  generatedCode: any;
  onApply: (logId: string) => void;
  isApplying: boolean;
  logId?: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  generatedCode,
  onApply,
  isApplying,
  logId
}) => {
  if (!generatedCode) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum código gerado ainda</p>
            <p className="text-sm">Use o gerador para criar código</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { files, sql, description } = generatedCode;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Prévia do Código Gerado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">{description}</p>
          </div>
        )}

        {files && Object.keys(files).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Arquivos ({Object.keys(files).length})
            </h4>
            {Object.entries(files).map(([filePath, content]) => (
              <div key={filePath} className="border rounded-lg">
                <div className="bg-muted px-3 py-2 text-sm font-mono">
                  {filePath}
                </div>
                <ScrollArea className="h-32 p-3">
                  <pre className="text-xs text-muted-foreground">
                    {String(content).substring(0, 500)}...
                  </pre>
                </ScrollArea>
              </div>
            ))}
          </div>
        )}

        {sql && sql.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              SQL Commands ({sql.length})
            </h4>
            {sql.map((sqlCmd: string, index: number) => (
              <div key={index} className="border rounded-lg">
                <div className="bg-muted px-3 py-2 text-sm font-mono">
                  SQL Command {index + 1}
                </div>
                <ScrollArea className="h-24 p-3">
                  <pre className="text-xs text-muted-foreground">
                    {sqlCmd}
                  </pre>
                </ScrollArea>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => onApply(logId || '')}
            disabled={isApplying || !logId}
          >
            <Play className="h-4 w-4 mr-2" />
            {isApplying ? 'Aplicando...' : 'Aplicar Código'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
