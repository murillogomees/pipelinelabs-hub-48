
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, User, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AccessLevel } from '../../AccessLevels/types';

interface AccessLevelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isRequired?: boolean;
}

const getIconForLevel = (name: string) => {
  switch (name) {
    case 'super_admin':
      return <Crown className="w-4 h-4 text-amber-500" />;
    case 'contratante':
      return <Shield className="w-4 h-4 text-blue-500" />;
    case 'operador':
      return <User className="w-4 h-4 text-green-500" />;
    default:
      return <Settings className="w-4 h-4 text-gray-500" />;
  }
};

export function AccessLevelSelector({ value, onChange, disabled = false, isRequired = true }: AccessLevelSelectorProps) {
  const { data: accessLevels = [] } = useQuery({
    queryKey: ['access-levels-for-select'],
    queryFn: async (): Promise<AccessLevel[]> => {
      const { data, error } = await supabase
        .from('access_levels')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as AccessLevel[];
    }
  });

  const selectedLevel = accessLevels.find(level => level.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="access_level">
        Nível de Acesso {isRequired && <span className="text-destructive">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled} required={isRequired}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione o nível de acesso">
            {selectedLevel && (
              <div className="flex items-center space-x-2">
                {getIconForLevel(selectedLevel.name)}
                <span>{selectedLevel.display_name}</span>
                <Badge variant="outline" className="ml-auto">
                  {selectedLevel.name}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accessLevels.map((level) => (
            <SelectItem key={level.id} value={level.id}>
              <div className="flex items-center space-x-2 w-full">
                {getIconForLevel(level.name)}
                <div className="flex-1">
                  <div className="font-medium">{level.display_name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {level.description}
                  </div>
                </div>
                <Badge 
                  variant={level.is_system ? 'secondary' : 'outline'} 
                  className="ml-2"
                >
                  {level.name}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
