import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordValidator } from '@/components/ui/password-validator';
import { SecureInput } from '@/components/Security/SecureInput';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  phone: string;
}

interface AuthFormFieldsProps {
  isSignUp: boolean;
  formData: FormData;
  onFormDataChange: (updates: Partial<FormData>) => void;
  onDocumentChange: (value: string) => void;
}

export function AuthFormFields({
  isSignUp,
  formData,
  onFormDataChange,
  onDocumentChange,
}: AuthFormFieldsProps) {
  return (
    <>
      {isSignUp && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <SecureInput
              id="firstName"
              label="Nome"
              type="text"
              value={formData.firstName}
              onChange={(e) => onFormDataChange({ firstName: e.target.value })}
              required
              maxLength={50}
              sanitize={true}
            />
            <SecureInput
              id="lastName"
              label="Sobrenome"
              type="text"
              value={formData.lastName}
              onChange={(e) => onFormDataChange({ lastName: e.target.value })}
              required
              maxLength={50}
              sanitize={true}
            />
          </div>
          
          <SecureInput
            id="companyName"
            label="Nome da Empresa"
            type="text"
            value={formData.companyName}
            onChange={(e) => onFormDataChange({ companyName: e.target.value })}
            required
            maxLength={100}
            sanitize={true}
          />

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={formData.documentType} 
                onValueChange={(value: 'cpf' | 'cnpj') => onFormDataChange({ documentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <SecureInput
                id="document"
                label={formData.documentType.toUpperCase()}
                type="text"
                value={formData.document}
                onChange={(e) => onDocumentChange(e.target.value)}
                placeholder={formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
                maxLength={18}
                sanitize={false}
              />
            </div>
          </div>

          <SecureInput
            id="phone"
            label="Telefone (opcional)"
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormDataChange({ phone: e.target.value })}
            maxLength={20}
            sanitize={false}
          />
        </>
      )}
      
      <SecureInput
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => onFormDataChange({ email: e.target.value })}
        required
        maxLength={100}
        sanitize={true}
      />
      
      <div className="space-y-2">
        <SecureInput
          id="password"
          label="Senha"
          type="password"
          value={formData.password}
          onChange={(e) => onFormDataChange({ password: e.target.value })}
          required
          showPasswordToggle={true}
          strengthMeter={isSignUp}
          maxLength={128}
          sanitize={false}
          helperText={isSignUp ? "Use pelo menos 8 caracteres com letras, números e símbolos" : undefined}
        />
        {isSignUp && formData.password && (
          <PasswordValidator password={formData.password} />
        )}
      </div>
    </>
  );
}