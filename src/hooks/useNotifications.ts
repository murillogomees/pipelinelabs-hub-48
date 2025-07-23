import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  company_id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read';
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
  read_at?: string;
  sent_via_email: boolean;
  sent_via_whatsapp: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  // Buscar notificações
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Notification[];
    },
  });

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadIds = notifications
        .filter(n => n.status === 'unread')
        .map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .in('id', unreadIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Deletar notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Configurar realtime
  useEffect(() => {
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Invalidar queries para atualizar a UI
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Mostrar toast para novas notificações
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            
            toast(newNotification.title, {
              description: newNotification.message,
              action: newNotification.action_url ? {
                label: newNotification.action_label || 'Ver',
                onClick: () => window.open(newNotification.action_url!, '_blank')
              } : undefined,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}

// Hook para criar notificações (usado pelo sistema)
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          company_id: await getCurrentCompanyId(),
          ...notification
        }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

async function getCurrentCompanyId(): Promise<string> {
  const { data } = await supabase.rpc('get_user_company_id');
  return data;
}