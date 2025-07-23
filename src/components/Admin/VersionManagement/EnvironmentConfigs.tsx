import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Save, Edit3, X } from "lucide-react";
import { useEnvironmentConfigs, useUpdateEnvironmentConfig, EnvironmentConfig } from "@/hooks/useAppVersions";

const EnvironmentBadge = ({ environment }: { environment: string }) => {
  const variants = {
    production: 'default',
    staging: 'secondary',
    preview: 'outline'
  } as const;

  const labels = {
    production: 'Produção',
    staging: 'Homologação',
    preview: 'Preview'
  };

  return (
    <Badge variant={variants[environment as keyof typeof variants] || 'outline'}>
      {labels[environment as keyof typeof labels] || environment}
    </Badge>
  );
};

export const EnvironmentConfigs = () => {
  const { data: configs, isLoading } = useEnvironmentConfigs();
  const updateConfigMutation = useUpdateEnvironmentConfig();
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    config: string;
    is_active: boolean;
  }>({ config: '', is_active: true });

  const startEditing = (config: EnvironmentConfig) => {
    setEditingConfig(config.id);
    setEditData({
      config: JSON.stringify(config.config, null, 2),
      is_active: config.is_active
    });
  };

  const cancelEditing = () => {
    setEditingConfig(null);
    setEditData({ config: '', is_active: true });
  };

  const saveConfig = async (configId: string) => {
    try {
      const parsedConfig = JSON.parse(editData.config);
      await updateConfigMutation.mutateAsync({
        id: configId,
        config: parsedConfig,
        is_active: editData.is_active
      });
      cancelEditing();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!configs?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma configuração encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <Card key={config.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <EnvironmentBadge environment={config.environment} />
                {!config.is_active && (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {editingConfig === config.id ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => saveConfig(config.id)}
                      disabled={updateConfigMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(config)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingConfig === config.id ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`active-${config.id}`}
                    checked={editData.is_active}
                    onCheckedChange={(checked) => 
                      setEditData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                  <Label htmlFor={`active-${config.id}`}>Ambiente ativo</Label>
                </div>
                <div className="space-y-2">
                  <Label>Configuração (JSON)</Label>
                  <Textarea
                    value={editData.config}
                    onChange={(e) => 
                      setEditData(prev => ({ ...prev, config: e.target.value }))
                    }
                    rows={8}
                    className="font-mono text-sm"
                    placeholder="{ ... }"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Status:</Label>
                  <Badge variant={config.is_active ? 'default' : 'secondary'}>
                    {config.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Configuração:</Label>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(config.config, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};