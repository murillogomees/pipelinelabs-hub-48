import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Edit3, Trash2, Eye, Code, FileText, GitBranch } from 'lucide-react';
import { useCodeAnalysis, FileAnalysis } from '@/hooks/useCodeAnalysis';

interface HooksAnalysisProps {
  searchTerm: string;
}

export function HooksAnalysis({ searchTerm }: HooksAnalysisProps) {
  const { analysisData, cleanupUnusedFiles } = useCodeAnalysis();
  const [selectedHook, setSelectedHook] = useState<FileAnalysis | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  const hooks = analysisData?.hooks || [];
  const filteredHooks = hooks.filter(hook => 
    hook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hook.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeHooks = filteredHooks.filter(h => h.isUsed);
  const unusedHooks = filteredHooks.filter(h => !h.isUsed);
  const complexHooks = filteredHooks.filter(h => h.complexity > 5);

  const handleEdit = (hook: FileAnalysis) => {
    setSelectedHook(hook);
    setEditContent(`// ${hook.name}\n// Caminho: ${hook.path}\n\nexport function ${hook.name}() {\n  // Implementação do hook\n  return {\n    // retorno do hook\n  };\n}`);
    setEditMode(true);
  };

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar o arquivo
    console.log('Salvando hook:', selectedHook?.name, editContent);
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Hooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredHooks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hooks Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeHooks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Não Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unusedHooks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alta Complexidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{complexHooks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Hooks do Projeto
          </CardTitle>
          <CardDescription>
            Gerencie todos os hooks customizados do projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHooks.map((hook, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">{hook.name}</span>
                    <div className="flex gap-1">
                      <Badge variant={hook.isUsed ? "default" : "destructive"}>
                        {hook.isUsed ? `${hook.usageCount} usos` : 'Não usado'}
                      </Badge>
                      {hook.complexity > 5 && (
                      <Badge variant="secondary">
                        Complexidade: {hook.complexity}
                      </Badge>
                      )}
                      {hook.issues.length > 0 && (
                        <Badge variant="destructive">
                          {hook.issues.length} problemas
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedHook(hook)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            {hook.name}
                          </DialogTitle>
                          <DialogDescription>{hook.path}</DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList>
                            <TabsTrigger value="details">Detalhes</TabsTrigger>
                            <TabsTrigger value="usage">Uso</TabsTrigger>
                            <TabsTrigger value="dependencies">Dependências</TabsTrigger>
                            <TabsTrigger value="edit">Editar</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="details" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Tamanho</label>
                                <p className="text-sm text-muted-foreground">
                                  {(hook.size / 1024).toFixed(1)}KB
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Última Modificação</label>
                                <p className="text-sm text-muted-foreground">{hook.lastModified}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Complexidade</label>
                                <p className="text-sm text-muted-foreground">{hook.complexity}/10</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <Badge variant={hook.isUsed ? "default" : "destructive"}>
                                  {hook.isUsed ? 'Ativo' : 'Não usado'}
                                </Badge>
                              </div>
                            </div>
                            
                            {hook.issues.length > 0 && (
                              <div>
                                <label className="text-sm font-medium">Problemas</label>
                                <div className="space-y-2 mt-2">
                                  {hook.issues.map((issue, idx) => (
                                    <div key={idx} className="p-2 border rounded text-sm">
                                      <Badge variant="destructive" className="mr-2">
                                        {issue.severity}
                                      </Badge>
                                      {issue.message}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="usage" className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Usado por ({hook.usedBy.length})</label>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {hook.usedBy.map((file, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {file}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="dependencies" className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Exports</label>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {hook.exports.map((exp, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {exp}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Imports</label>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {hook.imports.map((imp, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {imp}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="edit" className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Código do Hook</label>
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Código do hook..."
                                className="min-h-[300px] font-mono text-sm"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setEditMode(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleSave}>
                                <Code className="h-4 w-4 mr-2" />
                                Salvar Alterações
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(hook)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    {!hook.isUsed && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => cleanupUnusedFiles([hook.path])}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{hook.path}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span>Tamanho: {(hook.size / 1024).toFixed(1)}KB</span>
                    <span>Modificado: {hook.lastModified}</span>
                    <span>Complexidade: {hook.complexity}/10</span>
                  </div>
                </div>

                {hook.usedBy.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Usado por:</p>
                    <div className="flex flex-wrap gap-1">
                      {hook.usedBy.slice(0, 5).map((file, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                      {hook.usedBy.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{hook.usedBy.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}