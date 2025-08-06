import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Key, Eye, EyeOff, Plus, Edit3, Trash2, Save, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
  lastModified: string;
}

export function EnvironmentManager() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState(false);
  const [editingVar, setEditingVar] = useState<EnvironmentVariable | null>(null);
  const [newVar, setNewVar] = useState<Partial<EnvironmentVariable>>({});

  // Mock data - em produção viria de uma API real
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    {
      key: 'SUPABASE_URL',
      value: 'https://ycqinuwrlhuxotypqlfh.supabase.co',
      isSecret: false,
      description: 'URL do projeto Supabase',
      lastModified: '2024-01-15'
    },
    {
      key: 'SUPABASE_ANON_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      isSecret: false,
      description: 'Chave anônima do Supabase',
      lastModified: '2024-01-15'
    },
    {
      key: 'NFE_API_TOKEN',
      value: 'sk_live_...',
      isSecret: true,
      description: 'Token da API NFe.io',
      lastModified: '2024-01-12'
    },
    {
      key: 'STRIPE_SECRET_KEY',
      value: 'sk_live_...',
      isSecret: true,
      description: 'Chave secreta do Stripe',
      lastModified: '2024-01-10'
    }
  ]);

  const handleSaveVar = () => {
    if (editingVar) {
      setEnvVars(prev => prev.map(v => v.key === editingVar.key ? editingVar : v));
      toast({
        title: "Variável atualizada",
        description: `${editingVar.key} foi atualizada com sucesso.`,
      });
    } else if (newVar.key && newVar.value) {
      const variable: EnvironmentVariable = {
        key: newVar.key,
        value: newVar.value,
        isSecret: newVar.isSecret || false,
        description: newVar.description,
        lastModified: new Date().toISOString().split('T')[0]
      };
      setEnvVars(prev => [...prev, variable]);
      toast({
        title: "Variável criada",
        description: `${newVar.key} foi criada com sucesso.`,
      });
      setNewVar({});
    }
    setEditingVar(null);
  };

  const handleDeleteVar = (key: string) => {
    setEnvVars(prev => prev.filter(v => v.key !== key));
    toast({
      title: "Variável removida",
      description: `${key} foi removida com sucesso.`,
      variant: "destructive",
    });
  };

  const handleCopyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copiado",
      description: "Valor copiado para a área de transferência.",
    });
  };

  const maskSecret = (value: string) => {
    if (value.length <= 8) return '*'.repeat(value.length);
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  };

  const publicVars = envVars.filter(v => !v.isSecret);
  const secretVars = envVars.filter(v => v.isSecret);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciamento de Ambiente
          </CardTitle>
          <CardDescription>
            Configure variáveis de ambiente e secrets do projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ocultar Secrets
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Mostrar Secrets
                  </>
                )}
              </Button>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Variável
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Variável</DialogTitle>
                  <DialogDescription>
                    Configure uma nova variável de ambiente
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="key">Chave</Label>
                    <Input
                      id="key"
                      value={newVar.key || ''}
                      onChange={(e) => setNewVar(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="NOME_DA_VARIAVEL"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type={newVar.isSecret ? 'password' : 'text'}
                      value={newVar.value || ''}
                      onChange={(e) => setNewVar(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Valor da variável"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Input
                      id="description"
                      value={newVar.description || ''}
                      onChange={(e) => setNewVar(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da variável"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isSecret"
                      checked={newVar.isSecret || false}
                      onChange={(e) => setNewVar(prev => ({ ...prev, isSecret: e.target.checked }))}
                    />
                    <Label htmlFor="isSecret">É um secret (sensível)</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNewVar({})}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveVar}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="public" className="space-y-4">
        <TabsList>
          <TabsTrigger value="public">
            Variáveis Públicas ({publicVars.length})
          </TabsTrigger>
          <TabsTrigger value="secrets">
            Secrets ({secretVars.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variáveis Públicas</CardTitle>
              <CardDescription>
                Variáveis que podem ser expostas no frontend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {publicVars.map((envVar, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {envVar.key}
                          </code>
                          <Badge variant="outline">Público</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {envVar.description || 'Sem descrição'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyValue(envVar.value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVar(envVar)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVar(envVar.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <code className="text-xs text-muted-foreground break-all">
                        {envVar.value}
                      </code>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Última modificação: {envVar.lastModified}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secrets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                Secrets
              </CardTitle>
              <CardDescription>
                Variáveis sensíveis - apenas para backend/edge functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {secretVars.map((envVar, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {envVar.key}
                          </code>
                          <Badge variant="destructive">Secret</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {envVar.description || 'Sem descrição'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyValue(envVar.value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVar(envVar)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVar(envVar.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <code className="text-xs text-muted-foreground break-all">
                        {showSecrets ? envVar.value : maskSecret(envVar.value)}
                      </code>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Última modificação: {envVar.lastModified}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      {editingVar && (
        <Dialog open={!!editingVar} onOpenChange={() => setEditingVar(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Variável</DialogTitle>
              <DialogDescription>
                Modifique a variável {editingVar.key}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-key">Chave</Label>
                <Input
                  id="edit-key"
                  value={editingVar.key}
                  onChange={(e) => setEditingVar(prev => prev ? { ...prev, key: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-value">Valor</Label>
                <Input
                  id="edit-value"
                  type={editingVar.isSecret ? 'password' : 'text'}
                  value={editingVar.value}
                  onChange={(e) => setEditingVar(prev => prev ? { ...prev, value: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={editingVar.description || ''}
                  onChange={(e) => setEditingVar(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingVar(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveVar}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}