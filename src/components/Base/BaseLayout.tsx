import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Download, RefreshCw, Filter, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BaseLayoutAction {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface BaseLayoutProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  actions?: BaseLayoutAction[];
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backTo,
  actions = [],
  children,
  className = '',
  loading = false
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex-1 space-y-6 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled || loading}
                className="flex items-center gap-2"
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Content */}
      <div className="animate-fade-in">
        {children}
      </div>
    </div>
  );
};

// Layout específico para páginas de listagem
interface BaseListLayoutProps extends Omit<BaseLayoutProps, 'actions'> {
  onCreateNew?: () => void;
  createNewLabel?: string;
  showExport?: boolean;
  onExport?: () => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  filtersOpen?: boolean;
  additionalActions?: BaseLayoutAction[];
}

export const BaseListLayout: React.FC<BaseListLayoutProps> = ({
  onCreateNew,
  createNewLabel = 'Novo Item',
  showExport = false,
  onExport,
  showRefresh = false,
  onRefresh,
  showFilters = false,
  onToggleFilters,
  filtersOpen = false,
  additionalActions = [],
  loading = false,
  ...baseProps
}) => {
  const defaultActions: BaseLayoutAction[] = [
    ...additionalActions,
    ...(showFilters ? [{
      label: 'Filtros',
      icon: Filter,
      onClick: onToggleFilters!,
      variant: filtersOpen ? 'default' : 'outline'
    }] : []),
    ...(showRefresh ? [{
      label: 'Atualizar',
      icon: RefreshCw,
      onClick: onRefresh!,
      variant: 'outline'
    }] : []),
    ...(showExport ? [{
      label: 'Exportar',
      icon: Download,
      onClick: onExport!,
      variant: 'outline'
    }] : []),
    ...(onCreateNew ? [{
      label: createNewLabel,
      icon: Plus,
      onClick: onCreateNew,
      variant: 'default'
    }] : [])
  ] as BaseLayoutAction[];

  return (
    <BaseLayout
      {...baseProps}
      actions={defaultActions}
      loading={loading}
    />
  );
};

// Layout específico para páginas de configuração
interface BaseConfigLayoutProps extends Omit<BaseLayoutProps, 'actions'> {
  onSave?: () => void;
  onReset?: () => void;
  isDirty?: boolean;
  isValid?: boolean;
  additionalActions?: BaseLayoutAction[];
}

export const BaseConfigLayout: React.FC<BaseConfigLayoutProps> = ({
  onSave,
  onReset,
  isDirty = false,
  isValid = true,
  additionalActions = [],
  loading = false,
  ...baseProps
}) => {
  const defaultActions: BaseLayoutAction[] = [
    ...additionalActions,
    ...(onReset ? [{
      label: 'Redefinir',
      icon: RefreshCw,
      onClick: onReset,
      variant: 'outline' as const,
      disabled: !isDirty
    }] : []),
    ...(onSave ? [{
      label: 'Salvar Alterações',
      icon: Settings,
      onClick: onSave,
      variant: 'default' as const,
      disabled: !isDirty || !isValid
    }] : [])
  ];

  return (
    <BaseLayout
      {...baseProps}
      actions={defaultActions}
      loading={loading}
    />
  );
};