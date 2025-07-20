import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { ConfigField } from '@/hooks/useMarketplaceIntegrations';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DynamicConfigFormProps {
  fields: ConfigField[];
  form: UseFormReturn<any>;
  section?: 'config' | 'credentials';
}

export function DynamicConfigForm({ fields, form, section = 'config' }: DynamicConfigFormProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const togglePasswordVisibility = (fieldName: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(fieldName)) {
      newVisible.delete(fieldName);
    } else {
      newVisible.add(fieldName);
    }
    setVisiblePasswords(newVisible);
  };

  const renderField = (field: ConfigField) => {
    const fieldName = `${section}.${field.field}`;
    const isPasswordVisible = visiblePasswords.has(fieldName);

    return (
      <FormField
        key={field.field}
        control={form.control}
        name={fieldName}
        rules={{
          required: field.required ? `${field.label} é obrigatório` : false,
          validate: (value) => {
            if (field.validation) {
              if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
                return field.validation.message || `${field.label} tem formato inválido`;
              }
              if (field.validation.min && value && value.length < field.validation.min) {
                return `${field.label} deve ter pelo menos ${field.validation.min} caracteres`;
              }
              if (field.validation.max && value && value.length > field.validation.max) {
                return `${field.label} deve ter no máximo ${field.validation.max} caracteres`;
              }
            }
            return true;
          }
        }}
        render={({ field: formField }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <div className="space-y-1">
                {field.type === 'text' && (
                  <Input
                    {...formField}
                    placeholder={field.placeholder || field.label}
                    className="w-full"
                  />
                )}

                {field.type === 'password' && (
                  <div className="relative">
                    <Input
                      {...formField}
                      type={isPasswordVisible ? 'text' : 'password'}
                      placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility(fieldName)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                )}

                {field.type === 'number' && (
                  <Input
                    {...formField}
                    type="number"
                    placeholder={field.placeholder || field.label}
                    className="w-full"
                    onChange={(e) => formField.onChange(Number(e.target.value))}
                  />
                )}

                {field.type === 'email' && (
                  <Input
                    {...formField}
                    type="email"
                    placeholder={field.placeholder || field.label}
                    className="w-full"
                  />
                )}

                {field.type === 'url' && (
                  <Input
                    {...formField}
                    type="url"
                    placeholder={field.placeholder || 'https://exemplo.com'}
                    className="w-full"
                  />
                )}

                {field.type === 'select' && (
                  <Select
                    value={formField.value}
                    onValueChange={formField.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === 'boolean' && (
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={formField.value || false}
                      onCheckedChange={formField.onChange}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formField.value ? 'Ativado' : 'Desativado'}
                    </span>
                  </div>
                )}
              </div>
            </FormControl>
            {field.description && (
              <FormDescription className="text-xs text-muted-foreground">
                {field.description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="space-y-6">
      {fields.map(renderField)}
    </div>
  );
}