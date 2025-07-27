
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export function FinanceiroTab() {
  const { settings, isLoading, updateSettings, canEdit } = useCompanySettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (field: string, value: any) => {
    if (!canEdit) return;

    setIsSaving(true);
    try {
      const success = await updateSettings({ [field]: value });
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Configurações atualizadas com sucesso',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar configurações',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Financeiras</CardTitle>
          <CardDescription>
            Configure as preferências financeiras da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Moeda Padrão</Label>
            <Input
              id="currency"
              value={settings?.currency || 'BRL'}
              disabled={!canEdit}
              onChange={(e) => handleSave('currency', e.target.value)}
              placeholder="BRL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_tax_rate">Taxa de Imposto Padrão (%)</Label>
            <Input
              id="default_tax_rate"
              type="number"
              value={settings?.default_tax_rate || 0}
              disabled={!canEdit}
              onChange={(e) => handleSave('default_tax_rate', parseFloat(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="fiscal_notifications"
              disabled={!canEdit}
              defaultChecked={true}
              onCheckedChange={(checked) => handleSave('fiscal_notifications', checked)}
            />
            <Label htmlFor="fiscal_notifications">
              Notificações fiscais ativadas
            </Label>
          </div>

          <Button 
            onClick={() => handleSave('updated_at', new Date().toISOString())}
            disabled={!canEdit || isSaving}
            className="w-full"
          >
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
