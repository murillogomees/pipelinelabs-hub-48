
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AuthFormFieldsProps {
  isSignUp: boolean;
  formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    document: string;
    phone: string;
    documentType: 'cpf' | 'cnpj';
  };
  onFormDataChange: (updates: any) => void;
  onDocumentChange: (value: string) => void;
}

export function AuthFormFields({ 
  isSignUp, 
  formData, 
  onFormDataChange, 
  onDocumentChange 
}: AuthFormFieldsProps) {
  if (!isSignUp) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onFormDataChange({ email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onFormDataChange({ password: e.target.value })}
            required
            autoComplete="current-password"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ email: e.target.value })}
          required
          autoComplete="email"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => onFormDataChange({ firstName: e.target.value })}
            required
            autoComplete="given-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Sobrenome</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => onFormDataChange({ lastName: e.target.value })}
            required
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Nome da Empresa</Label>
        <Input
          id="companyName"
          type="text"
          value={formData.companyName}
          onChange={(e) => onFormDataChange({ companyName: e.target.value })}
          required
          autoComplete="organization"
        />
      </div>

      <div className="space-y-3">
        <Label>Tipo de Documento</Label>
        <RadioGroup
          value={formData.documentType}
          onValueChange={(value) => onFormDataChange({ documentType: value as 'cpf' | 'cnpj' })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cpf" id="cpf" />
            <Label htmlFor="cpf">CPF</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cnpj" id="cnpj" />
            <Label htmlFor="cnpj">CNPJ</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">
          {formData.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
        </Label>
        <Input
          id="document"
          type="text"
          value={formData.document}
          onChange={(e) => onDocumentChange(e.target.value)}
          placeholder={formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
          maxLength={formData.documentType === 'cpf' ? 11 : 14}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onFormDataChange({ phone: e.target.value })}
          placeholder="(11) 99999-9999"
          autoComplete="tel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => onFormDataChange({ password: e.target.value })}
          required
          autoComplete="new-password"
        />
      </div>
    </>
  );
}
