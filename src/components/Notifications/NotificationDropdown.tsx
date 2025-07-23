import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Check, 
  CheckCheck, 
  ExternalLink, 
  Settings, 
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationIcon } from './NotificationIcon';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const typeColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-orange-500',
  error: 'text-red-500',
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-blue-400',
  high: 'border-l-orange-400',
  critical: 'border-l-red-500',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onAction?: (url: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onAction
}) => {
  const Icon = typeIcons[notification.type];
  
  return (
    <div className={`
      border-l-4 ${priorityColors[notification.priority]} 
      p-3 hover:bg-accent/50 transition-colors
      ${notification.status === 'unread' ? 'bg-accent/20' : ''}
    `}>
      <div className="flex items-start gap-3">
        <Icon className={`h-4 w-4 mt-1 ${typeColors[notification.type]}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium leading-none">
              {notification.title}
            </h4>
            {notification.status === 'unread' && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {notification.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {format(new Date(notification.created_at), 'dd/MM HH:mm', { locale: ptBR })}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {notification.action_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => onAction?.(notification.action_url!)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              
              {notification.status === 'unread' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationDropdown: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isMarkingAsRead 
  } = useNotifications();

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleAction = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <NotificationIcon 
            count={unreadCount} 
            hasUnread={unreadCount > 0}
          />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full" size="sm">
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};