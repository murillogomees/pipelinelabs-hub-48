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
    <Card className="transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="start-date" className="text-sm font-medium">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-sm font-medium">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Quick Ranges */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Períodos Rápidos</Label>
          <div className="grid grid-cols-1 gap-2">
            {presetRanges.map((range) => (
              <Button
                key={range.days}
                variant="outline"
                size="sm"
                onClick={() => handlePresetRange(range.days)}
                className="justify-start text-left hover-scale"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Event Filter */}
        <div className="space-y-2">
          <Label htmlFor="event-filter" className="text-sm font-medium">Filtrar por Evento</Label>
          <Input
            id="event-filter"
            placeholder="Digite o nome do evento..."
            value={eventFilter}
            onChange={(e) => onEventFilterChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Export Button */}
        {onExport && (
          <Button 
            onClick={onExport} 
            variant="default" 
            className="w-full hover-scale bg-gradient-to-r from-primary to-primary/80"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        )}
      </CardContent>
    </Card>
  );
};