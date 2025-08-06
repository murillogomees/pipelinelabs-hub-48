import React from 'react';
import { Button } from '@/components/ui/button';
import { Building, MapPin, CreditCard, Bell, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SettingsTab = 'geral' | 'endereco' | 'financeiro' | 'notificacoes' | 'seguranca' | 'usuarios';

interface SettingsNavigationProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  canEdit: boolean;
}

const tabs = [
  {
    id: 'geral' as SettingsTab,
    label: 'Dados Gerais',
    icon: Building,
    description: 'Informações básicas da empresa'
  },
  {
    id: 'endereco' as SettingsTab,
    label: 'Endereço & Fiscal',
    icon: MapPin,
    description: 'Endereço e dados fiscais'
  },
  {
    id: 'financeiro' as SettingsTab,
    label: 'Financeiro',
    icon: CreditCard,
    description: 'Configurações financeiras'
  },
  {
    id: 'notificacoes' as SettingsTab,
    label: 'Notificações',
    icon: Bell,
    description: 'Preferências de notificações'
  },
  {
    id: 'seguranca' as SettingsTab,
    label: 'Segurança',
    icon: Shield,
    description: 'Configurações de segurança'
  },
  {
    id: 'usuarios' as SettingsTab,
    label: 'Usuários',
    icon: Users,
    description: 'Gerenciar usuários da empresa'
  }
];

export function SettingsNavigation({ activeTab, onTabChange, canEdit }: SettingsNavigationProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground mb-4">
        Configurações da Empresa
      </h3>
      
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-auto p-4 text-left",
              isActive && "bg-primary/10 text-primary border-primary/20"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="flex items-start gap-3 w-full">
              <Icon className={cn(
                "h-5 w-5 mt-0.5 flex-shrink-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {tab.label}
                </p>
                <p className={cn(
                  "text-xs mt-1",
                  isActive ? "text-primary/70" : "text-muted-foreground"
                )}>
                  {tab.description}
                </p>
              </div>
            </div>
          </Button>
        );
      })}
      
      {!canEdit && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            💡 Apenas contratantes podem editar as configurações da empresa
          </p>
        </div>
      )}
    </div>
  );
}