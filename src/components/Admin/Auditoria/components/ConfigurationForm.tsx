
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfigurationFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ConfigurationForm({ formData, setFormData }: ConfigurationFormProps) {
  const cronOptions = [
    { value: '0 2 * * *', label: 'Diariamente às 2:00' },
    { value: '0 2 * * 1', label: 'Semanalmente (segunda-feira às 2:00)' },
    { value: '0 2 1 * *', label: 'Mensalmente (dia 1 às 2:00)' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="auditoria-ativa">Auditoria Automática</Label>
          <p className="text-sm text-muted-foreground">
            Ativar execução automática da auditoria
          </p>
        </div>
        <Switch
          id="auditoria-ativa"
          name="auditoria_ativa"
          checked={formData.auditoria_ativa}
          onCheckedChange={(value) => 
            setFormData((prev: any) => ({ ...prev, auditoria_ativa: value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequencia">Frequência de Execução</Label>
        <select
          id="frequencia"
          name="frequencia_cron"
          value={formData.frequencia_cron}
          onChange={(e) => 
            setFormData((prev: any) => ({ ...prev, frequencia_cron: e.target.value }))
          }
          className="w-full p-2 border rounded-md bg-background"
        >
          {cronOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
