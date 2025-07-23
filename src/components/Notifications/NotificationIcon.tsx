import React from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NotificationIconProps {
  count: number;
  hasUnread: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({
  count,
  hasUnread,
  size = 'md',
  showBadge = true
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const Icon = hasUnread ? BellRing : Bell;

  return (
    <div className="relative inline-flex">
      <Icon 
        className={`${sizeMap[size]} ${hasUnread ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} 
      />
      {showBadge && count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center rounded-full"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </div>
  );
};