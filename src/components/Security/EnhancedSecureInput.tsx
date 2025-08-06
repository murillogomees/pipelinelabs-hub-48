
import React, { useState, useRef, useEffect } from 'react';
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
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  autoComplete?: string;
  id?: string;
  disabled?: boolean;
}

export const EnhancedSecureInput: React.FC<EnhancedSecureInputProps> = ({
  value,
  onChange,
  placeholder = 'Digite sua senha',
  className,
  maxLength,
  minLength,
  required,
  autoComplete = 'current-password',
  id,
  disabled
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Security monitoring
  useEffect(() => {
    if (attempts > 5) {
      setBlocked(true);
      logger.securityEvent('Multiple failed input attempts detected');
      setTimeout(() => {
        setBlocked(false);
        setAttempts(0);
      }, 60000); // 1 minute block
    }
  }, [attempts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Log suspicious activity
    if (newValue.length > 100) {
      logger.securityEvent('Unusually long input detected');
      return;
    }

    // Check for potential injection attempts
    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    if (suspiciousPatterns.some(pattern => pattern.test(newValue))) {
      logger.securityEvent('Potential script injection attempt');
      return;
    }

    onChange(newValue);
  };

  const handleFocus = () => {
    setInputFocused(true);
    logger.securityEvent('Secure input focused');
  };

  const handleBlur = () => {
    setInputFocused(false);
    if (value.length < (minLength || 0)) {
      setAttempts(prev => prev + 1);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    logger.info('Password visibility toggled');
  };

  if (blocked) {
    return (
      <div className="relative">
        <Input
          disabled
          placeholder="Entrada bloqueada temporariamente"
          className={cn(
            'pr-20 border-destructive',
            className
          )}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className={cn(
          'pr-20',
          inputFocused && 'ring-2 ring-blue-500/20',
          attempts > 3 && 'border-yellow-500',
          className
        )}
      />
      
      <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
        <Shield className={cn(
          'h-4 w-4',
          inputFocused ? 'text-green-500' : 'text-gray-400'
        )} />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0"
          onClick={togglePasswordVisibility}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {attempts > 2 && (
        <p className="text-xs text-yellow-600 mt-1">
          Atenção: {6 - attempts} tentativas restantes
        </p>
      )}
    </div>
  );
};
