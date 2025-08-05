
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdvancedSettingsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function AdvancedSettings({ formData, setFormData }: AdvancedSettingsProps) {
  const handleRegrasChange = (field: string, value: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      regras_preservacao: {
        ...prev.regras_preservacao,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configurações Avançadas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <Label>Configurações Avançadas</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="limite-problemas">Limite de Problemas para Alerta</Label>
            <Input
              id="limite-problemas"
              type="number"
              min="1"
              value={formData.limite_problemas_alerta}
              onChange={(e) => 
                setFormData((prev: any) => ({ ...prev, limite_problemas_alerta: parseInt(e.target.value) || 1 }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manter-historico">Manter Histórico (dias)</Label>
            <Input
              id="manter-historico"
              type="number"
              min="1"
              value={formData.manter_historico_dias}
              onChange={(e) => 
                setFormData((prev: any) => ({ ...prev, manter_historico_dias: parseInt(e.target.value) || 1 }))
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-limpeza">Limpeza Automática Segura</Label>
            <p className="text-sm text-muted-foreground">
              Aplicar automaticamente limpezas seguras
            </p>
          </div>
          <Switch
            id="auto-limpeza"
            checked={formData.auto_limpeza_segura}
            onCheckedChange={(value) => 
              setFormData((prev: any) => ({ ...prev, auto_limpeza_segura: value }))
            }
          />
        </div>
      </div>

      {/* Regras de Preservação */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <Label>Regras de Preservação</Label>
        </div>

        <div className="space-y-3">
          {Object.entries(formData.regras_preservacao).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="capitalize">
                {key.replace('_', ' ')}
              </Label>
              <Switch
                id={key}
                checked={value as boolean}
                onCheckedChange={(checked) => handleRegrasChange(key, checked)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
