
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export function FiscalTab() {
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
          <CardTitle>Configurações Fiscais</CardTitle>
          <CardDescription>
            Configure as preferências fiscais da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fiscal_year_start">Início do Ano Fiscal</Label>
            <Input
              id="fiscal_year_start"
              value={settings?.fiscal_year_start || '01/01'}
              disabled={!canEdit}
              onChange={(e) => handleSave('fiscal_year_start', e.target.value)}
              placeholder="01/01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_format">Formato de Data</Label>
            <Select
              value={settings?.date_format || 'DD/MM/YYYY'}
              disabled={!canEdit}
              onValueChange={(value) => handleSave('date_format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_format">Formato de Hora</Label>
            <Select
              value={settings?.time_format || '24h'}
              disabled={!canEdit}
              onValueChange={(value) => handleSave('time_format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="12h">12 horas</SelectItem>
              </SelectContent>
            </Select>
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
