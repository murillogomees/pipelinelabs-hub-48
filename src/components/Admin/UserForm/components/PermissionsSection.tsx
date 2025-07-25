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
  userType?: 'contratante' | 'operador';
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

export function PermissionsSection({ permissions, onPermissionChange, disabled = false, userType }: PermissionsSectionProps) {
  const categories = [...new Set(permissionConfig.map(p => p.category))];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Permissões de Acesso</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Configure os módulos e funcionalidades que o usuário pode acessar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {categories.map((category) => {
          const categoryPermissions = permissionConfig.filter(p => p.category === category);
          const enabledCount = categoryPermissions.filter(p => permissions[p.key]).length;
          
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                  >
                    {category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {enabledCount} de {categoryPermissions.length} habilitados
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {categoryPermissions.map((permission) => {
                  const Icon = permission.icon;
                  const isEnabled = permissions[permission.key] || false;
                  
                  return (
                    <div
                      key={permission.key}
                      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isEnabled 
                          ? 'bg-primary/5 border-primary/20 shadow-sm hover:shadow-md' 
                          : 'bg-card hover:bg-muted/30 border-border hover:border-border/80'
                      }`}
                      onClick={() => !disabled && onPermissionChange(permission.key, !isEnabled)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isEnabled 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Label 
                              htmlFor={permission.key}
                              className="text-sm font-medium cursor-pointer leading-none"
                            >
                              {permission.label}
                            </Label>
                            <Switch
                              id={permission.key}
                              checked={isEnabled}
                              onCheckedChange={(checked) => onPermissionChange(permission.key, checked)}
                              disabled={disabled}
                              className="data-[state=checked]:bg-primary scale-90"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Indicador visual de status */}
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full transition-opacity ${
                        isEnabled ? 'bg-primary opacity-100' : 'bg-muted-foreground/20 opacity-0 group-hover:opacity-50'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Resumo das permissões */}
        <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>
              Total: <strong>{Object.values(permissions).filter(Boolean).length}</strong> de{' '}
              <strong>{permissionConfig.length}</strong> funcionalidades habilitadas
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}