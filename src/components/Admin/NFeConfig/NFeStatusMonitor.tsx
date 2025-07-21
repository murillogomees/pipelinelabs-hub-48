import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface NFeStats {
  total: number;
  authorized: number;
  pending: number;
  rejected: number;
  cancelled: number;
  today: number;
  thisMonth: number;
}

interface RecentNFe {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  issue_date: string;
  customer_name?: string;
  rejection_reason?: string;
}

export function NFeStatusMonitor() {
  const { companyId } = useUserRole();
  const [refreshing, setRefreshing] = useState(false);

  // Buscar estatísticas de NFe
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['nfe-stats', companyId],
    queryFn: async (): Promise<NFeStats> => {
      if (!companyId) throw new Error('Company ID não encontrado');

      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('status, issue_date, total_amount')
        .eq('company_id', companyId)
        .eq('invoice_type', 'NFE');

      if (error) throw error;

      const stats: NFeStats = {
        total: invoices.length,
        authorized: invoices.filter(i => i.status === 'authorized').length,
        pending: invoices.filter(i => i.status === 'pending').length,
        rejected: invoices.filter(i => i.status === 'rejected').length,
        cancelled: invoices.filter(i => i.status === 'cancelled').length,
        today: invoices.filter(i => i.issue_date === today).length,
        thisMonth: invoices.filter(i => i.issue_date >= firstDayOfMonth).length,
      };

      return stats;
    },
    enabled: !!companyId,
    refetchInterval: 60000, // Atualizar a cada minuto
    staleTime: 30000 // 30 segundos
  });

  // Buscar NFes recentes
  const { data: recentNFes, isLoading: isLoadingRecent, refetch: refetchRecent } = useQuery({
    queryKey: ['recent-nfes', companyId],
    queryFn: async (): Promise<RecentNFe[]> => {
      if (!companyId) throw new Error('Company ID não encontrado');

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          total_amount,
          issue_date,
          customers(name)
        `)
        .eq('company_id', companyId)
        .eq('invoice_type', 'NFE')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return invoices.map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        total_amount: invoice.total_amount,
        issue_date: invoice.issue_date,
        customer_name: (invoice.customers as any)?.name,
      }));
    },
    enabled: !!companyId,
    refetchInterval: 60000, // Atualizar a cada minuto
    staleTime: 30000 // 30 segundos
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchRecent()]);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      authorized: { variant: 'default' as const, icon: CheckCircle, label: 'Autorizada' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pendente' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejeitada' },
      cancelled: { variant: 'outline' as const, icon: XCircle, label: 'Cancelada' },
      draft: { variant: 'outline' as const, icon: FileText, label: 'Rascunho' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoadingStats || isLoadingRecent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Carregando status das NFes...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Autorizadas</p>
                <p className="text-2xl font-bold text-green-600">{stats?.authorized || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monitor de Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor de NFes
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Estatísticas do período */}
            <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Hoje: {stats?.today || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Este mês: {stats?.thisMonth || 0}</span>
              </div>
            </div>

            {/* NFes Recentes */}
            <div>
              <h4 className="font-medium mb-3">NFes Recentes</h4>
              {recentNFes && recentNFes.length > 0 ? (
                <div className="space-y-2">
                  {recentNFes.map((nfe) => (
                    <div
                      key={nfe.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium">
                            #{nfe.invoice_number}
                          </span>
                          {getStatusBadge(nfe.status)}
                        </div>
                        {nfe.customer_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {nfe.customer_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(nfe.total_amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(nfe.issue_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Nenhuma NFe encontrada. Comece emitindo sua primeira nota fiscal.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}