import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';

interface AnalyticsFiltersProps {
  startDate: string;
  endDate: string;
  eventFilter: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEventFilterChange: (filter: string) => void;
  onExport?: () => void;
}

export const AnalyticsFilters = ({
  startDate,
  endDate,
  eventFilter,
  onStartDateChange,
  onEndDateChange,
  onEventFilterChange,
  onExport
}: AnalyticsFiltersProps) => {
  const presetRanges = [
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Últimos 30 dias', days: 30 },
    { label: 'Últimos 90 dias', days: 90 }
  ];

  const handlePresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="start-date">Data Inicial</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="end-date">Data Final</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Períodos Rápidos</Label>
          <div className="flex gap-2 mt-2">
            {presetRanges.map((range) => (
              <Button
                key={range.days}
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="event-filter">Filtrar por Evento</Label>
          <Input
            id="event-filter"
            placeholder="Digite o nome do evento..."
            value={eventFilter}
            onChange={(e) => onEventFilterChange(e.target.value)}
          />
        </div>

        {onExport && (
          <Button onClick={onExport} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        )}
      </CardContent>
    </Card>
  );
};