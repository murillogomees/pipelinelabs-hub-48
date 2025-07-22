import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeUserInput } from '@/lib/validation/sanitization';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  sanitize?: boolean;
  maxLength?: number;
  showPasswordToggle?: boolean;
  strengthMeter?: boolean;
  helperText?: string;
}

export function SecureInput({
  label,
  error,
  sanitize = true,
  maxLength = 255,
  showPasswordToggle = false,
  strengthMeter = false,
  helperText,
  className,
  onChange,
  type = 'text',
  ...props
}: SecureInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sanitizedValue, setSanitizedValue] = useState('');

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;
      
      // Limit length
      if (maxLength && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
      
      // Sanitize input if enabled
      if (sanitize && !isPassword) {
        value = sanitizeUserInput(value);
      }
      
      setSanitizedValue(value);
      
      // Calculate password strength
      if (strengthMeter && isPassword) {
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
      }
      
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
    [sanitize, isPassword, maxLength, onChange, strengthMeter]
  );

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const getStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-blue-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'Muito fraca';
      case 2:
        return 'Fraca';
      case 3:
        return 'Média';
      case 4:
        return 'Forte';
      case 5:
        return 'Muito forte';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          {...props}
          type={inputType}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            error && 'border-red-500 focus:border-red-500',
            isPassword && showPasswordToggle && 'pr-10',
            className
          )}
        />
        
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {strengthMeter && isPassword && sanitizedValue && (
        <div className="space-y-1">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-2 flex-1 rounded',
                  level <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Força da senha: {getStrengthText(passwordStrength)}
          </p>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-gray-600">{helperText}</p>
      )}
      
      {maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {sanitizedValue.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

export default SecureInput;