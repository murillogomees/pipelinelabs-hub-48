import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardSuspenseBoundary } from '@/components/Common/SuspenseBoundary';

interface BaseCardAction {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface BaseCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: BaseCardAction[];
  badges?: { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  animate?: boolean;
}

const sizeClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  description,
  children,
  actions = [],
  badges = [],
  className = '',
  size = 'md',
  loading = false,
  animate = true
}) => {
  return (
    <Card className={`
      ${className} 
      ${animate ? 'animate-fade-in hover-scale' : ''}
      ${loading ? 'opacity-50' : ''}
    `}>
      {(title || description || badges.length > 0 || actions.length > 0) && (
        <CardHeader className={sizeClasses[size]}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <CardTitle className="flex items-center gap-2">
                  {title}
                  {badges.map((badge, index) => (
                    <Badge key={index} variant={badge.variant || 'default'}>
                      {badge.label}
                    </Badge>
                  ))}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="mt-2">
                  {description}
                </CardDescription>
              )}
            </div>
            
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
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
        </CardHeader>
      )}
      
      <CardContent className={sizeClasses[size]}>
        <CardSuspenseBoundary>
          {children}
        </CardSuspenseBoundary>
      </CardContent>
    </Card>
  );
};

// Componente para estatísticas
interface BaseStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ElementType;
  description?: string;
  className?: string;
}

export const BaseStatsCard: React.FC<BaseStatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  className = ''
}) => {
  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return '';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case 'increase': return '↗';
      case 'decrease': return '↘';
      case 'neutral': return '→';
      default: return null;
    }
  };

  return (
    <BaseCard className={`hover:shadow-md transition-shadow ${className}`} size="md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          </div>
          
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {getChangeIcon()} {Math.abs(change.value)}%
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </BaseCard>
  );
};

// Componente para lista de itens
interface BaseListItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  actions?: BaseCardAction[];
}

interface BaseListCardProps {
  title: string;
  items: BaseListItem[];
  emptyMessage?: string;
  className?: string;
  onItemClick?: (item: BaseListItem) => void;
}

export const BaseListCard: React.FC<BaseListCardProps> = ({
  title,
  items,
  emptyMessage = 'Nenhum item encontrado',
  className = '',
  onItemClick
}) => {
  return (
    <BaseCard title={title} className={className}>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id}>
              <div
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  onItemClick ? 'hover:bg-muted cursor-pointer' : ''
                }`}
                onClick={() => onItemClick?.(item)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.badge && (
                      <Badge variant="secondary">{item.badge}</Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
                
                {item.actions && (
                  <div className="flex items-center gap-2">
                    {item.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant || 'ghost'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        disabled={action.disabled}
                      >
                        {action.icon && <action.icon className="h-4 w-4" />}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              {index < items.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </BaseCard>
  );
};