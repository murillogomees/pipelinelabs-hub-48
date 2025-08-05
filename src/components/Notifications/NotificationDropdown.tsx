
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function NotificationDropdown() {
  // Mock notifications - replace with real data
  const notifications = [
    {
      id: 1,
      title: 'Nova venda realizada',
      description: 'Venda #1234 no valor de R$ 150,00',
      time: '5 min atrás',
      read: false
    },
    {
      id: 2,
      title: 'Estoque baixo',
      description: 'Produto XYZ com apenas 3 unidades',
      time: '1 hora atrás',
      read: false
    },
    {
      id: 3,
      title: 'Backup concluído',
      description: 'Backup automático realizado com sucesso',
      time: '2 horas atrás',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          Notificações {unreadCount > 0 && `(${unreadCount})`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
              <div className="flex items-start justify-between w-full">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground">{notification.description}</p>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            Nenhuma notificação
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-sm text-muted-foreground">
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
