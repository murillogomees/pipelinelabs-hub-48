
import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthValidatorProps {
  password: string;
  onValidationChange: (isValid: boolean) => void;
}

interface ValidationRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    id: 'length',
    label: 'Pelo menos 8 caracteres',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Uma letra maiúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Uma letra minúscula',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Um número',
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'Um caractere especial',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export function PasswordStrengthValidator({ 
  password, 
  onValidationChange 
}: PasswordStrengthValidatorProps) {
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const results = validationRules.reduce((acc, rule) => {
      acc[rule.id] = rule.test(password);
      return acc;
    }, {} as Record<string, boolean>);

    setValidationResults(results);

    const isValid = Object.values(results).every(Boolean) && password.length > 0;
    onValidationChange(isValid);
  }, [password, onValidationChange]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Sua senha deve conter:
      </p>
      <div className="space-y-1">
        {validationRules.map((rule) => {
          const isValid = validationResults[rule.id];
          return (
            <div
              key={rule.id}
              className={cn(
                "flex items-center gap-2 text-sm",
                isValid ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {isValid ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
