import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateRequest, validateFormData, ValidationResult } from '@/lib/validation/middleware';

export interface UseValidationOptions {
  sanitizeInput?: boolean;
  maxPayloadSize?: number;
  onValidationError?: (errors: Record<string, string[]>) => void;
}

export function useValidation<T>(
  schema: z.ZodSchema<T>,
  options: UseValidationOptions = {}
) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    async (data: unknown): Promise<ValidationResult<T>> => {
      setIsValidating(true);
      setErrors({});

      try {
        const result = validateRequest(schema, data, {
          sanitizeInput: options.sanitizeInput,
          maxPayloadSize: options.maxPayloadSize,
        });

        if (!result.success && result.errors) {
          setErrors(result.errors);
          options.onValidationError?.(result.errors);
        }

        return result;
      } finally {
        setIsValidating(false);
      }
    },
    [schema, options]
  );

  const validateForm = useCallback(
    async (formData: FormData | Record<string, any>): Promise<ValidationResult<T>> => {
      setIsValidating(true);
      setErrors({});

      try {
        const result = validateFormData(schema, formData, {
          sanitizeInput: options.sanitizeInput,
          maxPayloadSize: options.maxPayloadSize,
        });

        if (!result.success && result.errors) {
          setErrors(result.errors);
          options.onValidationError?.(result.errors);
        }

        return result;
      } finally {
        setIsValidating(false);
      }
    },
    [schema, options]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName]?.[0];
  }, [errors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return !!(errors[fieldName] && errors[fieldName].length > 0);
  }, [errors]);

  return {
    validate,
    validateForm,
    errors,
    isValidating,
    clearErrors,
    getFieldError,
    hasFieldError,
    hasErrors: Object.keys(errors).length > 0,
  };
}

export function useFormValidation<T>(
  schema: z.ZodSchema<T>,
  options: UseValidationOptions = {}
) {
  const validation = useValidation(schema, options);

  const validateField = useCallback(
    async (fieldName: string, value: unknown): Promise<boolean> => {
      try {
        // For single field validation, create a simple schema
        const singleFieldSchema = z.object({
          [fieldName]: z.any()
        });
        
        const result = await validation.validate({ [fieldName]: value });
        return result.success;
      } catch {
        return false;
      }
    },
    [validation]
  );

  return {
    ...validation,
    validateField,
  };
}

export function useSecureForm<T>(
  schema: z.ZodSchema<T>,
  onSubmit: (data: T) => Promise<void> | void,
  options: UseValidationOptions = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const validation = useValidation(schema, {
    sanitizeInput: true,
    ...options,
  });

  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await validation.validate(data);
        
        if (result.success) {
          await onSubmit(result.data);
        } else {
          setSubmitError(result.error || 'Dados inválidos');
        }
      } catch (error: any) {
        setSubmitError(error.message || 'Erro interno do servidor');
      } finally {
        setIsSubmitting(false);
      }
    },
    [validation, onSubmit]
  );

  return {
    ...validation,
    handleSubmit,
    isSubmitting,
    submitError,
    clearSubmitError: () => setSubmitError(null),
  };
}