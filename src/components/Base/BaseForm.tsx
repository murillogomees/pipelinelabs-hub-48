import React from 'react';
import { useForm, FormProvider, FieldValues, DefaultValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { OptimizedInput, OptimizedTextarea } from '@/components/ui/optimized-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface BaseFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'date' | 'custom';
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  customComponent?: React.ComponentType<any>;
  validation?: z.ZodTypeAny;
  className?: string;
  disabled?: boolean;
  defaultValue?: any;
}

interface BaseFormProps<T extends FieldValues> {
  fields: BaseFormField[];
  onSubmit: SubmitHandler<T>;
  onCancel?: () => void;
  defaultValues?: DefaultValues<T>;
  schema?: z.ZodSchema<T>;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  columns?: 1 | 2 | 3;
}

export const BaseForm = <T extends FieldValues>({
  fields,
  onSubmit,
  onCancel,
  defaultValues,
  schema,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  className = '',
  layout = 'vertical',
  columns = 1
}: BaseFormProps<T>) => {
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues
  });

  const handleSubmit = (data: T) => {
    onSubmit(data);
  };

  const renderField = (field: BaseFormField) => {
    const { name, label, type, placeholder, description, required, options, customComponent: CustomComponent, disabled } = field;
    const fieldId = `field-${name}`;

    return (
      <FormField
        key={name}
        control={form.control}
        name={name as any}
        render={({ field: formField }) => (
          <FormItem className={field.className || ''}>
            <FormLabel className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
              {label}
            </FormLabel>
            <FormControl>
              {type === 'text' || type === 'email' || type === 'password' || type === 'number' || type === 'tel' || type === 'url' ? (
                <OptimizedInput
                  id={fieldId}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                  fullWidth={true}
                  {...formField}
                />
              ) : type === 'textarea' ? (
                <OptimizedTextarea
                  id={fieldId}
                  name={name}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={4}
                  fullWidth={true}
                  {...formField}
                />
              ) : type === 'select' ? (
                <Select
                  disabled={disabled}
                  value={formField.value}
                  onValueChange={formField.onChange}
                  name={name}
                >
                  <SelectTrigger id={fieldId}>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : type === 'checkbox' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={fieldId}
                    name={name}
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    disabled={disabled}
                  />
                  <label htmlFor={fieldId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {placeholder}
                  </label>
                </div>
              ) : type === 'radio' ? (
                <RadioGroup
                  value={formField.value}
                  onValueChange={formField.onChange}
                  disabled={disabled}
                  name={name}
                >
                  {options?.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} />
                      <label htmlFor={`${fieldId}-${option.value}`} className="text-sm font-medium leading-none">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              ) : type === 'switch' ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={fieldId}
                    name={name}
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    disabled={disabled}
                  />
                  <label htmlFor={fieldId} className="text-sm font-medium leading-none">
                    {placeholder}
                  </label>
                </div>
              ) : type === 'date' ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id={fieldId}
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formField.value && 'text-muted-foreground'
                      )}
                      disabled={disabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formField.value ? (
                        format(formField.value, 'PPP', { locale: ptBR })
                      ) : (
                        <span>{placeholder}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value}
                      onSelect={formField.onChange}
                      disabled={disabled}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                  <input
                    type="hidden"
                    name={name}
                    value={formField.value || ''}
                  />
                </Popover>
              ) : type === 'custom' && CustomComponent ? (
                <CustomComponent 
                  {...formField} 
                  disabled={disabled}
                  id={fieldId}
                  name={name}
                />
              ) : null}
            </FormControl>
            {description && (
              <FormDescription>{description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default: return 'grid-cols-1';
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-6 ${className}`}>
        <div className={`grid ${getGridCols()} gap-4`}>
          {fields.map(renderField)}
        </div>

        <div className="flex justify-end space-x-2 pt-6 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
