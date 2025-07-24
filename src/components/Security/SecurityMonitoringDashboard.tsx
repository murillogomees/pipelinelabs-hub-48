import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, Clock, Users, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  event_data: any;
  risk_level: string;
  created_at: string;
}

interface SecurityMetrics {
  total_events: number;
  high_risk_events: number;
  blocked_requests: number;
  unique_ips: number;
  events_by_hour: Record<string, number>;
}

export function SecurityMonitoringDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    if (!isSuperAdmin) return;
    
    fetchSecurityData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, [isSuperAdmin, selectedTimeRange]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Calculate time range
      const now = new Date();
      const hoursBack = selectedTimeRange === '24h' ? 24 : selectedTimeRange === '7d' ? 168 : 720;
      const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

      // Fetch recent security events
      const { data: eventsData, error: eventsError } = await supabase
        .from('security_audit_logs')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;

      setEvents((eventsData || []) as SecurityEvent[]);

      // Calculate metrics
      const totalEvents = eventsData?.length || 0;
      const highRiskEvents = eventsData?.filter(e => e.risk_level === 'high' || e.risk_level === 'critical').length || 0;
      const blockedRequests = eventsData?.filter(e => e.event_type.includes('blocked') || e.event_type.includes('rate_limit')).length || 0;
      const uniqueIps = new Set(eventsData?.map(e => e.ip_address).filter(Boolean)).size;

      // Group events by hour
      const eventsByHour: Record<string, number> = {};
      eventsData?.forEach(event => {
        const hour = new Date(event.created_at).getHours();
        const key = `${hour}:00`;
        eventsByHour[key] = (eventsByHour[key] || 0) + 1;
      });

      setMetrics({
        total_events: totalEvents,
        high_risk_events: highRiskEvents,
        blocked_requests: blockedRequests,
        unique_ips: uniqueIps,
        events_by_hour: eventsByHour
      });

    } catch (error) {
      console.error('Failed to fetch security data:', error);
      toast.error('Erro ao carregar dados de segurança');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'destructive'; // Changed from 'warning' to 'destructive'
      default: return 'secondary';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isSuperAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Acesso negado. Apenas super administradores podem acessar o monitoramento de segurança.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento de Segurança</h2>
          <p className="text-muted-foreground">
            Monitore eventos de segurança e atividades suspeitas em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          <Button onClick={fetchSecurityData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Security Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.high_risk_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              Eventos críticos detectados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueios</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics?.blocked_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Solicitações bloqueadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Únicos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics?.unique_ips || 0}</div>
            <p className="text-xs text-muted-foreground">
              Endereços diferentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Table */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList>
          <TabsTrigger value="events">Eventos Recentes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Segurança Recentes</CardTitle>
              <CardDescription>
                Últimos eventos de segurança registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando eventos...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento encontrado no período selecionado
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getRiskLevelColor(event.risk_level)}>
                            {event.risk_level.toUpperCase()}
                          </Badge>
                          <span className="font-medium">
                            {formatEventType(event.event_type)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(event.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.ip_address && (
                            <span className="mr-4">IP: {event.ip_address}</span>
                          )}
                          {event.user_id && (
                            <span className="mr-4">User ID: {event.user_id}</span>
                          )}
                        </div>
                        {event.event_data && Object.keys(event.event_data).length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-blue-600">
                              Ver detalhes
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                              {JSON.stringify(event.event_data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Eventos por Hora</CardTitle>
              <CardDescription>
                Distribuição de eventos de segurança ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.events_by_hour && Object.keys(metrics.events_by_hour).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(metrics.events_by_hour)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([hour, count]) => (
                      <div key={hour} className="flex items-center gap-4">
                        <span className="w-16 text-sm">{hour}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-blue-500 h-6 rounded-full flex items-center justify-center text-white text-xs"
                            style={{
                              width: `${Math.max((count / Math.max(...Object.values(metrics.events_by_hour))) * 100, 10)}%`
                            }}
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Dados insuficientes para análise
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SecurityMonitoringDashboard;