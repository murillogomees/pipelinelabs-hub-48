
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, AlertTriangle } from 'lucide-react';

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

      // Verificar se o usuário já tem associação com empresa
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (userCompanyError && userCompanyError.code !== 'PGRST116') {
        throw userCompanyError;
      }

      // Buscar uma empresa padrão para associar o usuário
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

      if (companiesError || !companies || companies.length === 0) {
        setFixResult('Nenhuma empresa encontrada no sistema');
        return;
      }

      // Buscar um nível de acesso padrão
      const { data: accessLevels, error: accessLevelsError } = await supabase
        .from('access_levels')
        .select('id, name, display_name')
        .eq('is_active', true)
        .limit(1);

      if (accessLevelsError || !accessLevels || accessLevels.length === 0) {
        setFixResult('Nenhum nível de acesso encontrado no sistema');
        return;
      }

      const defaultCompany = companies[0];
      const defaultAccessLevel = accessLevels[0];

      if (userCompany) {
        // Atualizar associação existente
        const { error: updateError } = await supabase
          .from('user_companies')
          .update({
            is_active: true,
            access_level_id: defaultAccessLevel.id,
            permissions: {
              dashboard: true,
              vendas: true,
              produtos: true,
              clientes: true,
              estoque: true,
              relatorios: true
            },
            specific_permissions: {
              dashboard: true,
              vendas: true,
              produtos: true,
              clientes: true,
              estoque: true,
              relatorios: true
            }
          })
          .eq('user_id', profile.user_id);

        if (updateError) throw updateError;

        setFixResult(`Acesso atualizado para ${profile.email}. Empresa: ${defaultCompany.name}, Nível: ${defaultAccessLevel.display_name}`);
      } else {
        // Criar nova associação
        const { error: insertError } = await supabase
          .from('user_companies')
          .insert({
            user_id: profile.user_id,
            company_id: defaultCompany.id,
            user_type: 'operador',
            access_level_id: defaultAccessLevel.id,
            permissions: {
              dashboard: true,
              vendas: true,
              produtos: true,
              clientes: true,
              estoque: true,
              relatorios: true
            },
            specific_permissions: {
              dashboard: true,
              vendas: true,
              produtos: true,
              clientes: true,
              estoque: true,
              relatorios: true
            },
            role: 'user',
            is_active: true
          });

        if (insertError) throw insertError;

        setFixResult(`Acesso criado para ${profile.email}. Empresa: ${defaultCompany.name}, Nível: ${defaultAccessLevel.display_name}`);
      }

      // Ativar o perfil do usuário também
      await supabase
        .from('profiles')
        .update({ is_active: true })
        .eq('user_id', profile.user_id);

      toast({
        title: 'Sucesso',
        description: 'Acesso do usuário foi corrigido com sucesso',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5" />
          <span>Correção de Acesso de Usuário</span>
        </CardTitle>
        <CardDescription>
          Ferramenta para corrigir o acesso do usuário murilloggomes@gmail.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta ação irá verificar e corrigir as permissões do usuário murilloggomes@gmail.com,
            associando-o a uma empresa e nível de acesso adequados.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={fixUserAccess}
          disabled={isFixing}
          className="w-full"
        >
          {isFixing ? 'Corrigindo...' : 'Corrigir Acesso do Usuário'}
        </Button>

        {fixResult && (
          <Alert className="mt-4">
            <AlertDescription>
              {fixResult}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
