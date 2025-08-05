import { useState, useCallback, useEffect } from 'react';
import { useForm, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

interface UseBaseFormProps<T extends FieldValues> {
  schema?: z.ZodSchema<T>;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  resetOnSuccess?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useBaseForm = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  onError,
  resetOnSuccess = true,
  showSuccessToast = true,
  showErrorToast = true,
  successMessage = 'Operação realizada com sucesso!',
  errorMessage = 'Erro ao processar operação'
}: UseBaseFormProps<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues
  });

  const { handleSubmit, reset, formState: { isDirty, isValid } } = form;

  const handleFormSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
      
      if (showSuccessToast) {
        toast({
          title: 'Sucesso',
          description: successMessage,
          variant: 'default'
        });
      }

      if (resetOnSuccess) {
        reset();
      }

      onSuccess?.(data);
    } catch (error: any) {
      const errorMsg = error?.message || errorMessage;
      setSubmitError(errorMsg);

      if (showErrorToast) {
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive'
        });
      }

      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, onSuccess, onError, reset, resetOnSuccess, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  const resetForm = useCallback(() => {
    reset();
    setSubmitError(null);
  }, [reset]);

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  // Auto-reset error after 5 seconds
  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => {
        setSubmitError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  return {
    form,
    handleSubmit: handleSubmit(handleFormSubmit),
    isSubmitting,
    submitError,
    isDirty,
    isValid,
    resetForm,
    clearError
  };
};