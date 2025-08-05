
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AuthFormFieldsProps {
  mode: 'signin' | 'signup';
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

export const AuthFormFields: React.FC<AuthFormFieldsProps> = ({
  mode,
  onSubmit,
  isLoading
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {mode === 'signup' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              id="companyName"
              {...register('companyName', { required: 'Nome da empresa é obrigatório' })}
              disabled={isLoading}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CNPJ</Label>
            <Input
              id="document"
              {...register('document', { required: 'CNPJ é obrigatório' })}
              disabled={isLoading}
            />
            {errors.document && (
              <p className="text-sm text-destructive">{errors.document.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone', { required: 'Telefone é obrigatório' })}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message as string}</p>
            )}
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email', { 
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          {...register('password', { 
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          })}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message as string}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Carregando...' : mode === 'signin' ? 'Entrar' : 'Cadastrar'}
      </Button>
    </form>
  );
};
