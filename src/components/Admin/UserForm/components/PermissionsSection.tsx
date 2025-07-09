import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PermissionsSectionProps {
  permissions: Record<string, boolean>;
  onPermissionChange: (permission: string, value: boolean) => void;
}

export function PermissionsSection({ permissions, onPermissionChange }: PermissionsSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Permissões de Acesso</Label>
      <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
        {Object.entries(permissions).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="text-sm font-normal">
              {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
            </Label>
            <Switch
              id={key}
              checked={value}
              onCheckedChange={(checked) => onPermissionChange(key, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}