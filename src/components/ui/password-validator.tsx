import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordValidatorProps {
  password: string;
  className?: string;
}

interface ValidationRule {
  test: (password: string) => boolean;
  message: string;
}

const validationRules: ValidationRule[] = [
  {
    test: (password) => password.length >= 8,
    message: 'Pelo menos 8 caracteres',
  },
  {
    test: (password) => /(?=.*[a-z])/.test(password),
    message: 'Pelo menos uma letra minúscula',
  },
  {
    test: (password) => /(?=.*[A-Z])/.test(password),
    message: 'Pelo menos uma letra maiúscula',
  },
  {
    test: (password) => /(?=.*\d)/.test(password),
    message: 'Pelo menos um número',
  },
  {
    test: (password) => /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password),
    message: 'Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)',
  },
];

export function PasswordValidator({ password, className }: PasswordValidatorProps) {
  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-muted-foreground">Requisitos da senha:</p>
      <div className="space-y-1">
        {validationRules.map((rule, index) => {
          const isValid = rule.test(password);
          return (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-2 text-sm',
                isValid ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {isValid ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              <span>{rule.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function validatePassword(password: string): string | null {
  for (const rule of validationRules) {
    if (!rule.test(password)) {
      return rule.message;
    }
  }
  return null;
}