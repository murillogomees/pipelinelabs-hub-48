
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, Copy, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeneratedCode {
  files: Record<string, string>;
  sql: string[];
  description: string;
  rawContent?: string;
}

interface CodePreviewProps {
  generatedCode: GeneratedCode;
  logId: string;
  onApply: (logId: string) => void;
  isApplying: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  generatedCode,
  logId,
  onApply,
  isApplying
}) => {
  const [activeTab, setActiveTab] = useState('description');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const fileCount = Object.keys(generatedCode.files || {}).length;
  const sqlCount = (generatedCode.sql || []).length;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Código Gerado</span>
          <div className="flex gap-2">
            {fileCount > 0 && (
              <Badge variant="secondary">
                {fileCount} arquivo{fileCount > 1 ? 's' : ''}
              </Badge>
            )}
            {sqlCount > 0 && (
              <Badge variant="secondary">
                {sqlCount} SQL{sqlCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Descrição</TabsTrigger>
            <TabsTrigger value="files">Arquivos ({fileCount})</TabsTrigger>
            <TabsTrigger value="sql">SQL ({sqlCount})</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{generatedCode.description}</p>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção:</strong> Revise cuidadosamente o código antes de aplicar.
                Esta ação irá modificar arquivos do projeto e executar comandos SQL.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => onApply(logId)}
              disabled={isApplying}
              className="w-full"
              variant="default"
            >
              {isApplying ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Aplicando ao projeto...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Aplicar no Projeto
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="files">
            <ScrollArea className="h-96">
              {Object.entries(generatedCode.files || {}).map(([filePath, content]) => (
                <Card key={filePath} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{filePath}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(content)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>{content}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sql">
            <ScrollArea className="h-96">
              {(generatedCode.sql || []).map((sqlQuery, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">SQL {index + 1}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(sqlQuery)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>{sqlQuery}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw">
            <ScrollArea className="h-96">
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                <code>{generatedCode.rawContent || JSON.stringify(generatedCode, null, 2)}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
