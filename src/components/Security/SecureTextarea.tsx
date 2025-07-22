import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeUserInput, sanitizeHtmlContent } from '@/lib/validation/sanitization';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  sanitize?: boolean;
  allowHtml?: boolean;
  maxLength?: number;
  helperText?: string;
}

export function SecureTextarea({
  label,
  error,
  sanitize = true,
  allowHtml = false,
  maxLength = 2000,
  helperText,
  className,
  onChange,
  ...props
}: SecureTextareaProps) {
  const [sanitizedValue, setSanitizedValue] = useState('');

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = event.target.value;
      
      // Limit length
      if (maxLength && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
      
      // Sanitize input if enabled
      if (sanitize) {
        value = allowHtml ? sanitizeHtmlContent(value, false) : sanitizeUserInput(value);
      }
      
      setSanitizedValue(value);
      
      // Update the textarea value
      const updatedEvent = {
        ...event,
        target: {
          ...event.target,
          value
        }
      };
      
      onChange?.(updatedEvent);
    },
    [sanitize, allowHtml, maxLength, onChange]
  );

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <Textarea
        {...props}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn(
          error && 'border-red-500 focus:border-red-500',
          className
        )}
      />
      
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

export default SecureTextarea;