
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Database } from 'lucide-react';

interface ScopeConfigurationProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function ScopeConfiguration({ formData, setFormData }: ScopeConfigurationProps) {
  const handleEscopoChange = (field: string, value: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      escopo_padrao: {
        ...prev.escopo_padrao,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4" />
        <Label>Escopo da Auditoria</Label>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(formData.escopo_padrao).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="capitalize">
              {key.replace('_', ' ')}
            </Label>
            <Switch
              id={key}
              checked={value as boolean}
              onCheckedChange={(checked) => handleEscopoChange(key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
