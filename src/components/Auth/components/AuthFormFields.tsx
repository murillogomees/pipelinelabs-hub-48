import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PasswordValidator } from '@/components/ui/password-validator';

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
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => onFormDataChange({ firstName: e.target.value })}
                required
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
            />
          </div>

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
              <Label htmlFor="document">{formData.documentType.toUpperCase()}</Label>
              <Input
                id="document"
                type="text"
                value={formData.document}
                onChange={(e) => onDocumentChange(e.target.value)}
                placeholder={formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onFormDataChange({ phone: e.target.value })}
            />
          </div>
        </>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange({ email: e.target.value })}
          required
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
        />
        {isSignUp && formData.password && (
          <PasswordValidator password={formData.password} />
        )}
      </div>
    </>
  );
}