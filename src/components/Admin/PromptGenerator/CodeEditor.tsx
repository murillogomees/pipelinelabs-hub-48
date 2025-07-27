
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  MessageCircle, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditableSection {
  id: string;
  title: string;
  description: string;
  content: string;
}

interface Suggestion {
  type: 'improvement' | 'fix' | 'feature';
  title: string;
  description: string;
  code?: string;
}

interface GeneratedCode {
  files: Record<string, string>;
  sql: string[];
  description: string;
  suggestions?: Suggestion[];
  editable_sections?: EditableSection[];
  rawContent?: string;
}

interface CodeEditorProps {
  generatedCode: GeneratedCode;
  logId: string;
  onApply: (logId: string) => void;
  onRevise: (prompt: string, originalCode: GeneratedCode) => void;
  isApplying: boolean;
  isRevising: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  generatedCode,
  logId,
  onApply,
  onRevise,
  isApplying,
  isRevising
}) => {
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editedFiles, setEditedFiles] = useState<Record<string, string>>({});
  const [editedSql, setEditedSql] = useState<string[]>([]);
  const [editedDescription, setEditedDescription] = useState(generatedCode.description);
  const [editedSections, setEditedSections] = useState<EditableSection[]>(
    generatedCode.editable_sections || []
  );
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [disabledSuggestions, setDisabledSuggestions] = useState<Set<number>>(new Set());

  // Inicializar arrays se não existirem
  React.useEffect(() => {
    if (!editedSql.length && generatedCode.sql.length) {
      setEditedSql([...generatedCode.sql]);
    }
  }, [generatedCode.sql, editedSql.length]);

  const handleFileEdit = useCallback((filePath: string, content: string) => {
    setEditedFiles(prev => ({
      ...prev,
      [filePath]: content
    }));
  }, []);

  const handleSqlEdit = useCallback((index: number, content: string) => {
    setEditedSql(prev => {
      const newSql = [...prev];
      newSql[index] = content;
      return newSql;
    });
  }, []);

  const handleSectionEdit = useCallback((sectionId: string, field: keyof EditableSection, value: string) => {
    setEditedSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, [field]: value }
          : section
      )
    );
  }, []);

  const addNewSqlCommand = useCallback(() => {
    setEditedSql(prev => [...prev, '']);
  }, []);

  const removeSqlCommand = useCallback((index: number) => {
    setEditedSql(prev => prev.filter((_, i) => i !== index));
  }, []);

  const toggleSuggestion = useCallback((index: number) => {
    setDisabledSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleRevise = useCallback(() => {
    if (!revisionPrompt.trim()) return;

    const currentCode = {
      ...generatedCode,
      files: { ...generatedCode.files, ...editedFiles },
      sql: editedSql,
      description: editedDescription,
      editable_sections: editedSections
    };

    onRevise(revisionPrompt, currentCode);
    setRevisionPrompt('');
    setShowRevisionInput(false);
  }, [revisionPrompt, generatedCode, editedFiles, editedSql, editedDescription, editedSections, onRevise]);

  const handleApply = useCallback(() => {
    // Aplicar as modificações antes de enviar
    const modifiedCode = {
      ...generatedCode,
      files: { ...generatedCode.files, ...editedFiles },
      sql: editedSql,
      description: editedDescription,
      editable_sections: editedSections
    };

    onApply(logId);
  }, [generatedCode, editedFiles, editedSql, editedDescription, editedSections, logId, onApply]);

  const getFileContent = useCallback((filePath: string) => {
    return editedFiles[filePath] || generatedCode.files[filePath] || '';
  }, [editedFiles, generatedCode.files]);

  const fileCount = Object.keys(generatedCode.files || {}).length;
  const sqlCount = editedSql.length;
  const suggestionsCount = (generatedCode.suggestions || []).length;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Editor de Código Gerado</span>
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
            {suggestionsCount > 0 && (
              <Badge variant="outline">
                {suggestionsCount} sugestão{suggestionsCount > 1 ? 'ões' : ''}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="description">Descrição</TabsTrigger>
            <TabsTrigger value="files">Arquivos ({fileCount})</TabsTrigger>
            <TabsTrigger value="sql">SQL ({sqlCount})</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões ({suggestionsCount})</TabsTrigger>
            <TabsTrigger value="sections">Seções Editáveis</TabsTrigger>
            <TabsTrigger value="revision">Revisão</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Código Gerado</Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Descreva o que foi implementado..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleApply}
                disabled={isApplying}
                className="flex-1"
                variant="default"
              >
                {isApplying ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Aplicar no Projeto
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowRevisionInput(true)}
                variant="outline"
                disabled={isRevising}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Revisar com IA
              </Button>
            </div>
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
                        onClick={() => setEditingFile(editingFile === filePath ? null : filePath)}
                      >
                        {editingFile === filePath ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingFile === filePath ? (
                      <div className="space-y-2">
                        <Textarea
                          value={getFileContent(filePath)}
                          onChange={(e) => handleFileEdit(filePath, e.target.value)}
                          rows={20}
                          className="font-mono text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingFile(null)}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditedFiles(prev => {
                                const newFiles = { ...prev };
                                delete newFiles[filePath];
                                return newFiles;
                              });
                              setEditingFile(null);
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-64">
                        <code>{getFileContent(filePath)}</code>
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sql">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {editedSql.map((sqlQuery, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">SQL {index + 1}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSqlCommand(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={sqlQuery}
                        onChange={(e) => handleSqlEdit(index, e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  onClick={addNewSqlCommand}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Comando SQL
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="suggestions">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {(generatedCode.suggestions || []).map((suggestion, index) => (
                  <Card key={index} className={`mb-4 ${disabledSuggestions.has(index) ? 'opacity-50' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={suggestion.type === 'improvement' ? 'default' : 
                                         suggestion.type === 'fix' ? 'destructive' : 'secondary'}>
                            {suggestion.type === 'improvement' ? 'Melhoria' : 
                             suggestion.type === 'fix' ? 'Correção' : 'Recurso'}
                          </Badge>
                          <span className="font-medium">{suggestion.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSuggestion(index)}
                        >
                          {disabledSuggestions.has(index) ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                      {suggestion.code && (
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                          <code>{suggestion.code}</code>
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {(generatedCode.suggestions || []).length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma sugestão foi gerada para este código.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sections">
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {editedSections.map((section) => (
                  <Card key={section.id} className="mb-4">
                    <CardHeader className="pb-2">
                      <Input
                        value={section.title}
                        onChange={(e) => handleSectionEdit(section.id, 'title', e.target.value)}
                        className="font-medium"
                      />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        value={section.description}
                        onChange={(e) => handleSectionEdit(section.id, 'description', e.target.value)}
                        placeholder="Descrição da seção..."
                      />
                      <Textarea
                        value={section.content}
                        onChange={(e) => handleSectionEdit(section.id, 'content', e.target.value)}
                        rows={4}
                        placeholder="Conteúdo editável..."
                      />
                    </CardContent>
                  </Card>
                ))}
                
                {editedSections.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma seção editável foi definida para este código.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="revision">
            <div className="space-y-4">
              <Alert>
                <MessageCircle className="h-4 w-4" />
                <AlertDescription>
                  Use esta seção para solicitar revisões do código gerado. A IA irá analisar o código atual e fazer as alterações solicitadas.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="revision-prompt">Prompt de Revisão</Label>
                <Textarea
                  id="revision-prompt"
                  value={revisionPrompt}
                  onChange={(e) => setRevisionPrompt(e.target.value)}
                  placeholder="Descreva as alterações que deseja fazer no código gerado..."
                  rows={4}
                />
              </div>
              
              <Button
                onClick={handleRevise}
                disabled={!revisionPrompt.trim() || isRevising}
                className="w-full"
                variant="outline"
              >
                {isRevising ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Revisando com IA...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Revisar com IA
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
