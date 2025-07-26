
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
        // Use a direct validation function instead of RPC call for now
        const passwordStrength = validatePasswordClient(password);
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

  // Client-side password validation function
  const validatePasswordClient = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    // Check password length
    if (password.length >= 12) {
      score += 2;
    } else if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use pelo menos 8 caracteres (12+ recomendado)');
    }

    // Check for lowercase letters
    if (password.match(/[a-z]/)) {
      score += 1;
    } else {
      feedback.push('Inclua letras minúsculas');
    }

    // Check for uppercase letters
    if (password.match(/[A-Z]/)) {
      score += 1;
    } else {
      feedback.push('Inclua letras maiúsculas');
    }

    // Check for numbers
    if (password.match(/[0-9]/)) {
      score += 1;
    } else {
      feedback.push('Inclua números');
    }

    // Check for special characters
    if (password.match(/[^A-Za-z0-9]/)) {
      score += 1;
    } else {
      feedback.push('Inclua caracteres especiais');
    }

    // Check for common patterns
    if (password.toLowerCase().match(/(password|123456|qwerty|admin|user|login)/)) {
      score -= 2;
      feedback.push('Evite senhas comuns');
    }

    // Check for repeated characters
    if (password.match(/(.)\1{2,}/)) {
      score -= 1;
      feedback.push('Evite caracteres repetidos');
    }

    const finalScore = Math.max(score, 0);
    let strength: PasswordStrength['strength'];
    
    if (finalScore >= 5) {
      strength = 'very_strong';
    } else if (finalScore >= 4) {
      strength = 'strong';
    } else if (finalScore >= 3) {
      strength = 'medium';
    } else if (finalScore >= 2) {
      strength = 'weak';
    } else {
      strength = 'very_weak';
    }

    return {
      score: finalScore,
      max_score: 6,
      strength,
      is_valid: finalScore >= 3,
      feedback
    };
  };

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
