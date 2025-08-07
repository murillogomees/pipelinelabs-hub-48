
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AuthFormFieldsProps {
  mode: 'signin' | 'signup';
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const AuthFormFields: React.FC<AuthFormFieldsProps> = ({
  mode,
  onSubmit,
  isLoading
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const isSignUp = mode === 'signup';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isSignUp && (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              {...register('name', { 
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              placeholder="Nome da sua empresa"
              {...register('companyName', { 
                required: 'Nome da empresa é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome da empresa deve ter pelo menos 2 caracteres'
                }
              })}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CNPJ</Label>
            <Input
              id="document"
              placeholder="00.000.000/0000-00"
              {...register('document', { 
                required: 'CNPJ é obrigatório',
                pattern: {
                  value: /^[\d.\-\/]+$/,
                  message: 'CNPJ deve conter apenas números, pontos, traços e barras'
                },
                minLength: {
                  value: 14,
                  message: 'CNPJ deve ter pelo menos 14 caracteres'
                }
              })}
            />
            {errors.document && (
              <p className="text-sm text-destructive">{errors.document.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register('phone', { 
                required: 'Telefone é obrigatório',
                pattern: {
                  value: /^[\(\)\d\s\-]+$/,
                  message: 'Telefone deve conter apenas números, parênteses, espaços e traços'
                },
                minLength: {
                  value: 10,
                  message: 'Telefone deve ter pelo menos 10 caracteres'
                }
              })}
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
          placeholder="seu@email.com"
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido',
            },
          })}
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
          placeholder="Sua senha"
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter no mínimo 6 caracteres',
            },
          })}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message as string}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Carregando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
      </Button>
    </form>
  );
};
