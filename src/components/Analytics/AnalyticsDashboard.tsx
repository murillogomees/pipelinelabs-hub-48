import { useState } from 'react';
import { useAnalyticsMetrics } from '@/hooks/useAnalytics';
import { AnalyticsCard } from './AnalyticsCard';
import { QuickStatsCard } from './QuickStatsCard';
import { EventsByDayChart, TopEventsChart, DeviceBreakdownChart, RouteBreakdownChart } from './AnalyticsCharts';
import { AnalyticsFilters } from './AnalyticsFilters';
import { Activity, Users, TrendingUp, Monitor, BarChart3, Clock, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const AnalyticsDashboard = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [eventFilter, setEventFilter] = useState('');

  const { data: metrics, isLoading, error } = useAnalyticsMetrics(startDate, endDate, eventFilter);

  const handleExport = () => {
    if (!metrics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Events', metrics.total_events],
      ['Unique Users', metrics.unique_users],
      ...metrics.top_events.map(event => [event.event_name, event.count])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${startDate}-${endDate}.csv`;
    a.click();
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados de analytics: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Analytics e Métricas
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Acompanhe o uso e performance do sistema em tempo real com visualizações interativas
            </p>
          </div>
          
          {/* Export button for desktop */}
          <div className="hidden sm:block">
            <Button onClick={handleExport} variant="outline" className="hover-scale">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Filters sidebar */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="sticky top-6">
              <AnalyticsFilters
                startDate={startDate}
                endDate={endDate}
                eventFilter={eventFilter}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onEventFilterChange={setEventFilter}
                onExport={handleExport}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="xl:col-span-4 order-1 xl:order-2 space-y-6">
            {isLoading ? (
              <div className="space-y-6 animate-fade-in">
                {/* Loading skeletons with better spacing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-96 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {/* Métricas principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <AnalyticsCard
                    title="Total de Eventos"
                    value={metrics?.total_events || 0}
                    icon={Activity}
                  />
                  <AnalyticsCard
                    title="Usuários Únicos"
                    value={metrics?.unique_users || 0}
                    icon={Users}
                  />
                  <AnalyticsCard
                    title="Eventos por Dia"
                    value={metrics?.total_events ? Math.round(metrics.total_events / 30) : 0}
                    icon={TrendingUp}
                  />
                  <AnalyticsCard
                    title="Tipos de Evento"
                    value={metrics?.top_events?.length || 0}
                    icon={Monitor}
                  />
                </div>

                {/* Estatísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickStatsCard
                    title="Engajamento Médio"
                    value={metrics?.total_events && metrics?.unique_users ? 
                      (metrics.total_events / metrics.unique_users).toFixed(1) : 0}
                    format="number"
                    icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                  />
                  <QuickStatsCard
                    title="Atividade por Usuário"
                    value={metrics?.total_events && metrics?.unique_users ? 
                      Math.round(metrics.total_events / metrics.unique_users) : 0}
                    format="number"
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  />
                </div>

                {/* Gráficos principais */}
                {metrics ? (
                  <div className="space-y-6">
                    {/* Gráfico de linha principal - destaque */}
                    <div className="w-full">
                      <EventsByDayChart data={metrics.events_by_day || {}} />
                    </div>
                    
                    {/* Grid de gráficos secundários */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      <TopEventsChart data={metrics.top_events || []} />
                      <DeviceBreakdownChart data={metrics.device_breakdown || {}} />
                      <RouteBreakdownChart data={metrics.route_breakdown || {}} />
                    </div>
                  </div>
                ) : (
                  <Alert className="animate-fade-in">
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum dado encontrado para o período selecionado.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};