import React, { useCallback } from 'react';
import { z } from 'zod';
import { useSecureForm } from '@/hooks/useValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield } from 'lucide-react';

interface SecureFormProps<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: (props: {
    getFieldError: (fieldName: string) => string | undefined;
    hasFieldError: (fieldName: string) => boolean;
    clearErrors: () => void;
  }) => React.ReactNode;
  submitButtonText?: string;
  className?: string;
  showSecurityBadge?: boolean;
}

export function SecureForm<T>({
  schema,
  onSubmit,
  children,
  submitButtonText = 'Enviar',
  className = '',
  showSecurityBadge = true
}: SecureFormProps<T>) {
  const {
    handleSubmit,
    getFieldError,
    hasFieldError,
    clearErrors,
    isSubmitting,
    submitError,
    clearSubmitError,
    hasErrors
  } = useSecureForm(schema, onSubmit);

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      clearSubmitError();
      
      const formData = new FormData(event.currentTarget);
      const data: Record<string, any> = {};
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          data[key] = value;
        } else {
          data[key] = value;
        }
      }
      
      handleSubmit(data);
    },
    [handleSubmit, clearSubmitError]
  );

  return (
    <form onSubmit={handleFormSubmit} className={className}>
      {showSecurityBadge && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          <Shield className="h-4 w-4" />
          <span>Formulário protegido com validação e sanitização</span>
        </div>
      )}
      
      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      
      {children({ getFieldError, hasFieldError, clearErrors })}
      
      <Button
        type="submit"
        disabled={isSubmitting || hasErrors}
        className="w-full"
      >
        {isSubmitting ? 'Processando...' : submitButtonText}
      </Button>
    </form>
  );
}

export default SecureForm;