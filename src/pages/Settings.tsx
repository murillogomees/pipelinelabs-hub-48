
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SettingsNavigation, SettingsTab } from '@/components/Settings/SettingsNavigation';
import { CompanyGeneralForm } from '@/components/Settings/Company/CompanyGeneralForm';
import { CompanyAddressForm } from '@/components/Settings/Company/CompanyAddressForm';
import { useCompanyManagement } from '@/hooks/useCompanyManagement';
import { AlertCircle, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');
  const { companyData, isLoading, error, updateCompany, isUpdating, canEdit } = useCompanyManagement();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados da empresa: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma empresa encontrada para este usuário.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geral':
        return (
          <CompanyGeneralForm
            companyData={companyData}
            onSubmit={updateCompany}
            isLoading={isUpdating}
            canEdit={canEdit}
          />
        );
        
      case 'endereco':
        return (
          <CompanyAddressForm
            companyData={companyData}
            onSubmit={updateCompany}
            isLoading={isUpdating}
            canEdit={canEdit}
          />
        );
        
      case 'financeiro':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configurações Financeiras</CardTitle>
              <CardDescription>
                Configurações relacionadas ao sistema financeiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                🚧 Em desenvolvimento - Configurações financeiras
              </p>
            </CardContent>
          </Card>
        );
        
      case 'notificacoes':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Gerencie suas preferências de notificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                🚧 Em desenvolvimento - Configurações de notificações
              </p>
            </CardContent>
          </Card>
        );
        
      case 'seguranca':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configurações de segurança e privacidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                🚧 Em desenvolvimento - Configurações de segurança
              </p>
            </CardContent>
          </Card>
        );
        
      case 'usuarios':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Adicionar e gerenciar usuários da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                🚧 Em desenvolvimento - Gerenciamento de usuários
              </p>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Configurações</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua empresa de forma fácil e organizada
        </p>
      </div>

      {/* Layout responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navegação lateral */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <SettingsNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              canEdit={canEdit}
            />
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
