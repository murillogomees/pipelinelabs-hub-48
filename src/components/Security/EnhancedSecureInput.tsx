import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { sanitizeUserInput } from '@/lib/validation/sanitization';
import { AlertCircle, Eye, EyeOff, Shield, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/logger';

interface EnhancedSecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  sanitize?: boolean;
  maxLength?: number;
  showPasswordToggle?: boolean;
  strengthMeter?: boolean;
  helperText?: string;
  securityLevel?: 'low' | 'medium' | 'high';
  allowedChars?: RegExp;
  blockList?: string[];
  realTimeValidation?: boolean;
}

export function EnhancedSecureInput({
  label,
  error,
  sanitize = true,
  maxLength = 255,
  showPasswordToggle = false,
  strengthMeter = false,
  helperText,
  securityLevel = 'medium',
  allowedChars,
  blockList = [],
  realTimeValidation = true,
  className,
  onChange,
  type = 'text',
  ...props
}: EnhancedSecureInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sanitizedValue, setSanitizedValue] = useState('');
  const [validationStatus, setValidationStatus] = useState<'valid' | 'invalid' | 'pending'>('pending');

  const isPassword = type === 'password';

  // Enhanced security validation
  const validateInput = useCallback((value: string): { isValid: boolean; reason?: string } => {
    // Check for blocked content
    if (blockList.some(blocked => value.toLowerCase().includes(blocked.toLowerCase()))) {
      logger.securityEvent('blocked_input_detected', undefined, { 
        inputType: type,
        securityLevel,
        blockedContent: '[REDACTED]'
      });
      return { isValid: false, reason: 'Conteúdo não permitido detectado' };
    }

    // Check allowed characters
    if (allowedChars && !allowedChars.test(value)) {
      return { isValid: false, reason: 'Caracteres não permitidos' };
    }

    // Length validation
    if (value.length > maxLength) {
      return { isValid: false, reason: `Máximo ${maxLength} caracteres` };
    }

    // Security level checks
    if (securityLevel === 'high') {
      // No HTML tags
      if (/<[^>]*>/g.test(value)) {
        logger.securityEvent('html_injection_attempt', undefined, {
          inputType: type,
          content: '[REDACTED]'
        });
        return { isValid: false, reason: 'Tags HTML não são permitidas' };
      }

      // No SQL injection patterns
      const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
      if (sqlPatterns.test(value)) {
        logger.securityEvent('sql_injection_attempt', undefined, {
          inputType: type,
          content: '[REDACTED]'
        });
        return { isValid: false, reason: 'Padrões SQL não são permitidos' };
      }

      // No JavaScript injection patterns
      const jsPatterns = /(javascript:|data:text\/html|vbscript:|onload=|onerror=)/gi;
      if (jsPatterns.test(value)) {
        logger.securityEvent('xss_attempt', undefined, {
          inputType: type,
          content: '[REDACTED]'
        });
        return { isValid: false, reason: 'Código JavaScript não é permitido' };
      }
    }

    return { isValid: true };
  }, [blockList, allowedChars, maxLength, securityLevel, type]);

  const calculatePasswordStrength = useCallback((password: string): number => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Character types
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    return Math.min(score, 100);
  }, []);

  const getStrengthColor = (strength: number): string => {
    if (strength < 30) return 'bg-destructive';
    if (strength < 60) return 'bg-warning';
    if (strength < 80) return 'bg-primary';
    return 'bg-success';
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 30) return 'Muito Fraca';
    if (strength < 60) return 'Fraca';
    if (strength < 80) return 'Boa';
    return 'Forte';
  };

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      
      // Real-time validation
      if (realTimeValidation) {
        const validation = validateInput(value);
        setValidationStatus(validation.isValid ? 'valid' : 'invalid');
      }

      // Sanitize input if enabled
      if (sanitize && !isPassword) {
        value = sanitizeUserInput(value);
      }

      // Calculate password strength if enabled
      if (strengthMeter && isPassword) {
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
      }

      setSanitizedValue(value);
      
      // Update the input value
      const updatedEvent = {
        ...event,
        target: {
          ...event.target,
          value
        }
      };
      
      onChange?.(updatedEvent);
    },
    [sanitize, isPassword, strengthMeter, calculatePasswordStrength, validateInput, realTimeValidation, onChange]
  );

  const getSecurityIcon = () => {
    if (!realTimeValidation) return null;
    
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
          {securityLevel === 'high' && (
            <Shield className="inline h-3 w-3 ml-1 text-primary" />
          )}
        </Label>
      )}
      
      <div className="relative">
        <Input
          {...props}
          type={isPassword && showPassword ? 'text' : type}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            error && 'border-destructive focus:border-destructive',
            realTimeValidation && validationStatus === 'valid' && 'border-success',
            realTimeValidation && validationStatus === 'invalid' && 'border-destructive',
            'pr-10',
            className
          )}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {getSecurityIcon()}
          {isPassword && showPasswordToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {strengthMeter && isPassword && sanitizedValue && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Força da senha:</span>
            <span className={cn(
              passwordStrength < 30 && 'text-destructive',
              passwordStrength >= 30 && passwordStrength < 60 && 'text-warning',
              passwordStrength >= 60 && passwordStrength < 80 && 'text-primary',
              passwordStrength >= 80 && 'text-success'
            )}>
              {getStrengthText(passwordStrength)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                getStrengthColor(passwordStrength)
              )}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      
      {maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {sanitizedValue.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

export default EnhancedSecureInput;