
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, AlertTriangle, Shield } from 'lucide-react';

export function UserAccessFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);
  const { toast } = useToast();

  const fixUserAccess = async () => {
    setIsFixing(true);
    setFixResult(null);

    try {
      // Buscar o usuário pelo email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, display_name')
        .eq('email', 'murilloggomes@gmail.com')
        .single();

      if (profileError || !profile) {
        setFixResult('Usuário não encontrado no sistema');
        return;
      }

      console.log('User found:', profile);

      // Verificar se o usuário já tem associação com empresa
      const { data: userCompanies, error: userCompanyError } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', profile.user_id);

      if (userCompanyError) {
        console.error('Error fetching user companies:', userCompanyError);
        throw userCompanyError;
      }

      console.log('User companies:', userCompanies);

      // Buscar empresa Pipeline Labs ou primeira empresa disponível
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .or('name.eq.Pipeline Labs,name.ilike.%pipeline%')
        .limit(1);

      if (companiesError || !companies || companies.length === 0) {
        // Fallback: buscar qualquer empresa
        const { data: fallbackCompanies } = await supabase
          .from('companies')
          .select('id, name')
          .limit(1);
        
        if (!fallbackCompanies || fallbackCompanies.length === 0) {
          setFixResult('Nenhuma empresa encontrada no sistema');
          return;
        }
        companies[0] = fallbackCompanies[0];
      }

      const targetCompany = companies[0];
      console.log('Target company:', targetCompany);

      // Buscar nível de acesso de super_admin
      const { data: accessLevels, error: accessLevelsError } = await supabase
        .from('access_levels')
        .select('id, name, display_name, permissions')
        .eq('name', 'super_admin')
        .eq('is_active', true)
        .limit(1);

      let superAdminAccessLevel = accessLevels?.[0] || null;

      // Se não encontrar, criar nível super_admin
      if (!superAdminAccessLevel) {
        const { data: newAccessLevel, error: createError } = await supabase
          .from('access_levels')
          .insert({
            name: 'super_admin',
            display_name: 'Super Administrador',
            description: 'Acesso total ao sistema',
            is_active: true,
            is_system: true,
            permissions: {
              dashboard: true,
              vendas: true,
              produtos: true,
              clientes: true,
              fornecedores: true,
              estoque: true,
              financeiro: true,
              relatorios: true,
              configuracoes: true,
              admin: true,
              usuarios: true,
              empresas: true,
              sistema: true,
              seguranca: true,
              notas_fiscais: true,
              contratos: true,
              producao: true,
              compras: true,
              integracoes: true,
              super_admin_access: true,
              system_management: true,
              security_monitoring: true,
              user_management: true,
              company_management: true
            }
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating super admin access level:', createError);
          throw createError;
        }

        superAdminAccessLevel = newAccessLevel;
        console.log('Created super admin access level:', superAdminAccessLevel);
      }

      const existingUserCompany = userCompanies?.find(uc => uc.company_id === targetCompany.id);

      const superAdminPermissions = {
        dashboard: true,
        vendas: true,
        produtos: true,
        clientes: true,
        fornecedores: true,
        estoque: true,
        financeiro: true,
        relatorios: true,
        configuracoes: true,
        admin: true,
        usuarios: true,
        empresas: true,
        sistema: true,
        seguranca: true,
        notas_fiscais: true,
        contratos: true,
        producao: true,
        compras: true,
        integracoes: true,
        super_admin_access: true,
        system_management: true,
        security_monitoring: true,
        user_management: true,
        company_management: true
      };

      if (existingUserCompany) {
        // Atualizar associação existente
        const { error: updateError } = await supabase
          .from('user_companies')
          .update({
            user_type: 'super_admin',
            access_level_id: superAdminAccessLevel.id,
            is_active: true,
            role: 'super_admin',
            permissions: superAdminPermissions,
            specific_permissions: superAdminPermissions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUserCompany.id);

        if (updateError) {
          console.error('Error updating user company:', updateError);
          throw updateError;
        }

        console.log('Updated existing user company association');
        setFixResult(`Acesso atualizado para ${profile.email}. Empresa: ${targetCompany.name}, Tipo: Super Admin`);
      } else {
        // Criar nova associação
        const { error: insertError } = await supabase
          .from('user_companies')
          .insert({
            user_id: profile.user_id,
            company_id: targetCompany.id,
            user_type: 'super_admin',
            access_level_id: superAdminAccessLevel.id,
            role: 'super_admin',
            is_active: true,
            permissions: superAdminPermissions,
            specific_permissions: superAdminPermissions
          });

        if (insertError) {
          console.error('Error creating user company:', insertError);
          throw insertError;
        }

        console.log('Created new user company association');
        setFixResult(`Acesso criado para ${profile.email}. Empresa: ${targetCompany.name}, Tipo: Super Admin`);
      }

      // Ativar o perfil do usuário também
      await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('user_id', profile.user_id);

      // Usar a função RPC para configurar super admin se existir
      try {
        await supabase.rpc('setup_initial_super_admin', {
          p_email: 'murilloggomes@gmail.com'
        });
        console.log('RPC setup_initial_super_admin executed successfully');
      } catch (rpcError) {
        console.warn('RPC setup_initial_super_admin not available or failed:', rpcError);
        // Não é crítico se o RPC falhar
      }

      toast({
        title: 'Sucesso',
        description: 'Acesso de super administrador configurado com sucesso',
      });

    } catch (error: any) {
      console.error('Erro ao corrigir acesso:', error);
      setFixResult(`Erro ao corrigir acesso: ${error.message}`);
      
      toast({
        title: 'Erro',
        description: 'Falha ao corrigir acesso do usuário',
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };

  const testUserPermissions = async () => {
    try {
      // Testar permissões atuais do usuário
      const { data: currentUser } = await supabase.auth.getUser();
      console.log('Current user:', currentUser);

      const { data: userPermissions } = await supabase
        .from('user_companies')
        .select(`
          user_type,
          is_active,
          permissions,
          specific_permissions,
          access_level_id,
          company_id,
          companies:company_id(name),
          access_levels:access_level_id(name, display_name, permissions)
        `)
        .eq('user_id', currentUser.user?.id);

      console.log('Current user permissions:', userPermissions);

      // Testar função RPC is_super_admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      console.log('is_super_admin RPC result:', isSuperAdmin);

      setFixResult(`Teste executado - Verifique o console do navegador para detalhes das permissões atuais`);
    } catch (error) {
      console.error('Erro ao testar permissões:', error);
      setFixResult(`Erro no teste: ${error}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Correção de Acesso - Super Admin</span>
          </CardTitle>
          <CardDescription>
            Ferramenta para configurar acesso de super administrador para murilloggomes@gmail.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta ação irá configurar o usuário murilloggomes@gmail.com como super administrador
              com acesso total ao sistema, incluindo a área de gestão de usuários.
            </AlertDescription>
          </Alert>

          <div className="grid gap-3">
            <Button 
              onClick={fixUserAccess}
              disabled={isFixing}
              className="w-full"
              variant="default"
            >
              <Shield className="w-4 h-4 mr-2" />
              {isFixing ? 'Configurando Super Admin...' : 'Configurar como Super Admin'}
            </Button>

            <Button 
              onClick={testUserPermissions}
              variant="outline"
              className="w-full"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Testar Permissões Atuais (ver console)
            </Button>
          </div>

          {fixResult && (
            <Alert className="mt-4">
              <AlertDescription>
                {fixResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
