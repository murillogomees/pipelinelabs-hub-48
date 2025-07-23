// Common composed components built from UI primitives

import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { colorVariants, spacingClasses, containerClasses } from './utils';
import { cn } from '@/lib/utils';

// Action interface for buttons
export interface UIAction {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: keyof typeof colorVariants;
  disabled?: boolean;
  loading?: boolean;
}

// Enhanced Card with common patterns
interface EnhancedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: UIAction[];
  badges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }>;
  className?: string;
  size?: keyof typeof spacingClasses;
  loading?: boolean;
  animated?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  description,
  children,
  actions = [],
  badges = [],
  className,
  size = 'md',
  loading = false,
  animated = true
}) => {
  return (
    <Card className={cn(
      containerClasses.card,
      animated && "animate-fade-in hover-scale",
      loading && "opacity-50",
      className
    )}>
      {(title || description || badges.length > 0 || actions.length > 0) && (
        <CardHeader className={spacingClasses[size]}>
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
      
      <CardContent className={spacingClasses[size]}>
        {children}
      </CardContent>
    </Card>
  );
};

// Stats Card Component
interface StatsCardProps {
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

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  description,
  className
}) => {
  const getChangeStyles = () => {
    if (!change) return { color: '', icon: null };
    
    const styles = {
      increase: { color: 'text-green-600', icon: '↗' },
      decrease: { color: 'text-red-600', icon: '↘' },
      neutral: { color: 'text-gray-600', icon: '→' }
    };
    
    return styles[change.type];
  };

  const changeStyles = getChangeStyles();

  return (
    <EnhancedCard className={cn("hover:shadow-md transition-shadow", className)} size="md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          </div>
          
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <span className={cn("text-sm font-medium", changeStyles.color)}>
                {changeStyles.icon} {Math.abs(change.value)}%
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
};

// List Card Component
interface ListItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  actions?: UIAction[];
}

interface ListCardProps {
  title: string;
  items: ListItem[];
  emptyMessage?: string;
  className?: string;
  onItemClick?: (item: ListItem) => void;
  loading?: boolean;
}

export const ListCard: React.FC<ListCardProps> = ({
  title,
  items,
  emptyMessage = 'Nenhum item encontrado',
  className,
  onItemClick,
  loading = false
}) => {
  return (
    <EnhancedCard title={title} className={className} loading={loading}>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id}>
              <div
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors",
                  onItemClick && "hover:bg-muted cursor-pointer"
                )}
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
    </EnhancedCard>
  );
};