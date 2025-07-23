import { useState } from 'react';
import { useAnalyticsMetrics } from '@/hooks/useAnalytics';
import { AnalyticsCard } from './AnalyticsCard';
import { EventsByDayChart, TopEventsChart, DeviceBreakdownChart, RouteBreakdownChart } from './AnalyticsCharts';
import { AnalyticsFilters } from './AnalyticsFilters';
import { Activity, Users, TrendingUp, Monitor } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics e Métricas</h1>
        <p className="text-muted-foreground">
          Acompanhe o uso e performance do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
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

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <EventsByDayChart data={metrics.events_by_day || {}} />
              </div>
              <TopEventsChart data={metrics.top_events || []} />
              <DeviceBreakdownChart data={metrics.device_breakdown || {}} />
              <RouteBreakdownChart data={metrics.route_breakdown || {}} />
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Nenhum dado encontrado para o período selecionado.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};