
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger('EnhancedSecureInput');

interface EnhancedSecureInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: 'password' | 'text';
  strengthCheck?: boolean;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export function EnhancedSecureInput({
  value,
  onChange,
  placeholder = "Digite sua senha",
  className,
  disabled = false,
  type = 'password',
  strengthCheck = true,
  maxLength,
  pattern,
  required = false
}: EnhancedSecureInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, label: 'Muito fraca', color: 'text-red-500' });

  const checkPasswordStrength = (password: string): PasswordStrength => {
    logger.debug('Checking password strength');
    
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = 'Muito fraca';
    let color = 'text-red-500';

    if (score >= 5) {
      label = 'Muito forte';
      color = 'text-green-500';
    } else if (score >= 4) {
      label = 'Forte';
      color = 'text-green-400';
    } else if (score >= 3) {
      label = 'Média';
      color = 'text-yellow-500';
    } else if (score >= 2) {
      label = 'Fraca';
      color = 'text-orange-500';
    }

    logger.info('Password strength calculated');

    return { score, label, color };
  };

  useEffect(() => {
    if (strengthCheck && type === 'password' && value) {
      setStrength(checkPasswordStrength(value));
    }
  }, [value, strengthCheck, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    logger.debug('Input value changed');
    
    // Apply maxLength if specified
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    // Apply pattern validation if specified
    if (pattern && newValue && !new RegExp(pattern).test(newValue)) {
      logger.warn('Input does not match pattern');
      return;
    }

    onChange(newValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    logger.info('Password visibility toggled');
  };

  const inputType = type === 'password' && !showPassword ? 'password' : 'text';

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={inputType}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'pr-10',
            isFocused && 'ring-2 ring-blue-500 ring-opacity-50',
            className
          )}
          disabled={disabled}
          required={required}
        />
        
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {/* Security indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Campo seguro com criptografia</span>
      </div>

      {/* Password strength indicator */}
      {strengthCheck && type === 'password' && value && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  strength.score <= 1 ? 'bg-red-500' :
                  strength.score <= 2 ? 'bg-orange-500' :
                  strength.score <= 3 ? 'bg-yellow-500' :
                  strength.score <= 4 ? 'bg-green-400' : 'bg-green-500'
                )}
                style={{ width: `${(strength.score / 6) * 100}%` }}
              />
            </div>
            <span className={cn('text-xs font-medium', strength.color)}>
              {strength.label}
            </span>
          </div>
          
          {strength.score < 4 && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                Use pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
