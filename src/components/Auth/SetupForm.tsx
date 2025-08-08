
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Building, User, ArrowRight } from 'lucide-react';

interface SetupFormProps {
  onSuccess: () => void;
}

export function SetupForm({ onSuccess }: SetupFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do perfil
    displayName: user?.user_metadata?.display_name || '',
    phone: user?.user_metadata?.phone || '',
    document: user?.user_metadata?.document || '',
    
    // Dados da empresa
    companyName: user?.user_metadata?.company_name || `${user?.user_metadata?.display_name || 'Minha'} - Empresa`,
    companyDocument: '',
    companyEmail: user?.email || '',
    companyPhone: user?.user_metadata?.phone || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado. Tente fazer login novamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Iniciando setup manual para usuário:', user.id);

      // 1. Criar a empresa primeiro
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          document: formData.companyDocument,
          email: formData.companyEmail,
          phone: formData.companyPhone,
          user_id: user.id,
        })
        .select()
        .single();

      if (companyError) {
        console.error('❌ Erro ao criar empresa:', companyError);
        throw companyError;
      }

      console.log('✅ Empresa criada:', company.id);

      // 2. Criar o perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          display_name: formData.displayName,
          phone: formData.phone,
          document: formData.document,
          company_id: company.id,
          access_level_id: 'contratante', // Definir como contratante por padrão
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Perfil criado/atualizado');

      // 3. Criar a relação user_companies
      const { error: userCompanyError } = await supabase
        .from('user_companies')
        .upsert({
          user_id: user.id,
          company_id: company.id,
          role: 'contratante',
          is_active: true,
          updated_at: new Date().toISOString(),
        });

      if (userCompanyError) {
        console.error('❌ Erro ao criar relação usuário-empresa:', userCompanyError);
        throw userCompanyError;
      }

      console.log('✅ Relação usuário-empresa criada');

      toast({
        title: '🎉 Configuração concluída!',
        description: 'Sua conta e empresa foram configuradas com sucesso.',
      });

      // Aguardar um pouco para garantir que os dados foram salvos
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (error: any) {
      console.error('❌ Erro no setup manual:', error);
      
      toast({
        title: 'Erro na configuração',
        description: error.message || 'Erro ao configurar sua conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Building className="h-6 w-6 text-primary" />
          <span>Finalizar Configuração</span>
        </CardTitle>
        <CardDescription>
          Complete os dados abaixo para finalizar a configuração da sua conta
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção do Perfil */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Dados Pessoais</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome Completo *</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input
                  id="document"
                  name="document"
                  value={formData.document}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Seção da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>Dados da Empresa</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Nome da sua empresa"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyDocument">CNPJ da Empresa *</Label>
                <Input
                  id="companyDocument"
                  name="companyDocument"
                  value={formData.companyDocument}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email da Empresa</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  placeholder="contato@empresa.com"
                  type="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Telefone da Empresa</Label>
                <Input
                  id="companyPhone"
                  name="companyPhone"
                  value={formData.companyPhone}
                  onChange={handleInputChange}
                  placeholder="(11) 3333-3333"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Configurando...
              </>
            ) : (
              <>
                Finalizar Configuração
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
