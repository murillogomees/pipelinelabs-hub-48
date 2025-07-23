import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  Plus, 
  Settings, 
  Filter,
  Search,
  MoreHorizontal,
  Check,
  CheckCheck,
  Trash2,
  Eye,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Send,
  Mail,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useNotifications, useCreateNotification, type Notification } from '@/hooks/useNotifications';

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

const priorityVariants = {
  low: 'secondary',
  medium: 'outline',
  high: 'default',
  critical: 'destructive',
} as const;

const CreateNotificationDialog: React.FC = () => {
  const { mutate: createNotification, isPending: isCreating } = useCreateNotification();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    category: 'system',
    priority: 'medium' as const,
    action_url: '',
    action_label: '',
    send_email: false,
    send_whatsapp: false,
    expires_in_days: 30,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expires_at = formData.expires_in_days > 0 
      ? new Date(Date.now() + formData.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    createNotification({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      category: formData.category,
      priority: formData.priority,
      action_url: formData.action_url || undefined,
      action_label: formData.action_label || undefined,
      metadata: {},
      expires_at,
      sent_via_email: formData.send_email,
      sent_via_whatsapp: formData.send_whatsapp,
      status: 'unread',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Notificação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Notificação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Informação</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action_url">URL da Ação (opcional)</Label>
              <Input
                id="action_url"
                value={formData.action_url}
                onChange={(e) => setFormData(prev => ({ ...prev, action_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action_label">Texto do Botão (opcional)</Label>
              <Input
                id="action_label"
                value={formData.action_label}
                onChange={(e) => setFormData(prev => ({ ...prev, action_label: e.target.value }))}
                placeholder="Ver detalhes"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Opções de Envio</Label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="send_email"
                  checked={formData.send_email}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_email: checked }))}
                />
                <Label htmlFor="send_email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar por email
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="send_whatsapp"
                  checked={formData.send_whatsapp}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_whatsapp: checked }))}
                />
                <Label htmlFor="send_whatsapp" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Enviar por WhatsApp
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isCreating}>
              <Send className="h-4 w-4 mr-2" />
              {isCreating ? 'Criando...' : 'Criar Notificação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function AdminNotificacoes() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    isLoading 
  } = useNotifications();

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    category: '',
    priority: '',
    search: '',
  });

  const filteredNotifications = notifications.filter(notification => {
    if (filters.status && notification.status !== filters.status) return false;
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.category && notification.category !== filters.category) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return notification.title.toLowerCase().includes(searchLower) ||
             notification.message.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const criticalCount = notifications.filter(n => n.priority === 'critical' && n.status === 'unread').length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore todas as notificações do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateNotificationDialog />
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => 
                    new Date(n.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notificações..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-9"
              />
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="estoque">Estoque</SelectItem>
                <SelectItem value="clientes">Clientes</SelectItem>
                <SelectItem value="produtos">Produtos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => markAllAsRead()}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas ({unreadCount})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => {
                    const Icon = typeIcons[notification.type];
                    return (
                      <TableRow key={notification.id} className={notification.status === 'unread' ? 'bg-accent/20' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {notification.status === 'unread' ? (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-xs">
                              {notification.status === 'unread' ? 'Não lida' : 'Lida'}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${typeColors[notification.type]}`} />
                            <span className="text-xs capitalize">{notification.type}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {notification.message}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">{notification.category}</Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={priorityVariants[notification.priority]}>
                            {notification.priority}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm">
                            {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {notification.status === 'unread' && (
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Marcar como lida
                                </DropdownMenuItem>
                              )}
                              {notification.action_url && (
                                <DropdownMenuItem onClick={() => window.open(notification.action_url!, '_blank')}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  {notification.action_label || 'Abrir link'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}