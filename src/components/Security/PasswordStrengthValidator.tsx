
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface PasswordStrength {
  score: number;
  max_score: number;
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  is_valid: boolean;
  feedback: string[];
}

interface PasswordStrengthValidatorProps {
  password: string;
  onValidationChange?: (isValid: boolean, strength: PasswordStrength | null) => void;
  className?: string;
}

export function PasswordStrengthValidator({ 
  password, 
  onValidationChange,
  className = '' 
}: PasswordStrengthValidatorProps) {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!password) {
      setStrength(null);
      onValidationChange?.(false, null);
      return;
    }

    const validatePassword = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('validate_password_strength', {
          password
        });

        if (error) throw error;

        const passwordStrength = data as PasswordStrength;
        setStrength(passwordStrength);
        onValidationChange?.(passwordStrength.is_valid, passwordStrength);
      } catch (error) {
        console.error('Error validating password:', error);
        setStrength(null);
        onValidationChange?.(false, null);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(validatePassword, 300);
    return () => clearTimeout(debounceTimer);
  }, [password, onValidationChange]);

  if (!password || !strength) return null;

  const getStrengthColor = (strengthLevel: string) => {
    switch (strengthLevel) {
      case 'very_strong': return 'text-green-600';
      case 'strong': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-orange-600';
      case 'very_weak': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStrengthLabel = (strengthLevel: string) => {
    switch (strengthLevel) {
      case 'very_strong': return 'Muito Forte';
      case 'strong': return 'Forte';
      case 'medium': return 'Média';
      case 'weak': return 'Fraca';
      case 'very_weak': return 'Muito Fraca';
      default: return 'Desconhecida';
    }
  };

  const progressPercentage = (strength.score / strength.max_score) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Força da Senha</span>
        <Badge 
          variant={strength.is_valid ? "default" : "destructive"}
          className={getStrengthColor(strength.strength)}
        >
          {getStrengthLabel(strength.strength)}
        </Badge>
      </div>

      <Progress 
        value={progressPercentage} 
        className="h-2"
      />

      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Sugestões para melhorar:
          </span>
          <ul className="space-y-1">
            {strength.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                <X className="h-3 w-3 text-red-500" />
                {feedback}
              </li>
            ))}
          </ul>
        </div>
      )}

      {strength.is_valid && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Check className="h-3 w-3" />
          Senha atende aos requisitos de segurança
        </div>
      )}
    </div>
  );
}
