import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users as UsersIcon, 
  DollarSign, 
  FileText, 
  Cog,
  FileCheck,
  ShoppingBag,
  Archive,
  TrendingUp,
  Activity,
  Globe,
  Zap,
  Settings
} from 'lucide-react';

interface PermissionsSectionProps {
  permissions: Record<string, boolean>;
  onPermissionChange: (permission: string, value: boolean) => void;
  disabled?: boolean;
}

const permissionConfig = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Visualizar painéis e estatísticas',
    icon: BarChart3,
    category: 'Geral'
  },
  {
    key: 'vendas',
    label: 'Vendas',
    description: 'Gerenciar vendas e PDV',
    icon: ShoppingCart,
    category: 'Comercial'
  },
  {
    key: 'produtos',
    label: 'Produtos',
    description: 'Cadastrar e gerenciar produtos',
    icon: Package,
    category: 'Comercial'
  },
  {
    key: 'clientes',
    label: 'Clientes',
    description: 'Gerenciar base de clientes',
    icon: UsersIcon,
    category: 'Comercial'
  },
  {
    key: 'compras',
    label: 'Compras',
    description: 'Gerenciar compras e fornecedores',
    icon: ShoppingBag,
    category: 'Comercial'
  },
  {
    key: 'estoque',
    label: 'Estoque',
    description: 'Controle de estoque e movimentações',
    icon: Archive,
    category: 'Operacional'
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    description: 'Controle financeiro e relatórios',
    icon: DollarSign,
    category: 'Financeiro'
  },
  {
    key: 'notas_fiscais',
    label: 'Notas Fiscais',
    description: 'Emissão de NFe, NFSe e NFCe',
    icon: FileText,
    category: 'Fiscal'
  },
  {
    key: 'producao',
    label: 'Produção',
    description: 'Ordens de produção e serviços',
    icon: Cog,
    category: 'Operacional'
  },
  {
    key: 'contratos',
    label: 'Contratos',
    description: 'Gestão de contratos',
    icon: FileCheck,
    category: 'Jurídico'
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    description: 'Visualizar e gerar relatórios',
    icon: TrendingUp,
    category: 'Relatórios'
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Análises avançadas e métricas',
    icon: Activity,
    category: 'Relatórios'
  },
  {
    key: 'marketplace_canais',
    label: 'Marketplace Canais',
    description: 'Integração com marketplaces',
    icon: Globe,
    category: 'Integrações'
  },
  {
    key: 'integracoes',
    label: 'Integrações',
    description: 'Configurar integrações externas',
    icon: Zap,
    category: 'Integrações'
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    description: 'Configurações gerais do sistema',
    icon: Settings,
    category: 'Sistema'
  }
];

export function PermissionsSection({ permissions, onPermissionChange, disabled = false }: PermissionsSectionProps) {
  const categories = [...new Set(permissionConfig.map(p => p.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões de Acesso</CardTitle>
        <CardDescription>
          Defina quais funcionalidades o usuário pode acessar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryPermissions = permissionConfig.filter(p => p.category === category);
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{category}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryPermissions.map((permission) => {
                    const Icon = permission.icon;
                    
                    return (
                      <div
                        key={permission.key}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Label 
                              htmlFor={permission.key}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.label}
                            </Label>
                            <Switch
                              id={permission.key}
                              checked={permissions[permission.key] || false}
                              onCheckedChange={(checked) => onPermissionChange(permission.key, checked)}
                              disabled={disabled}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}