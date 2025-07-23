import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: React.ReactNode;
}

export const QuickStatsCard = ({ 
  title, 
  value, 
  previousValue, 
  format = 'number',
  icon 
}: QuickStatsCardProps) => {
  const formatValue = (val: string | number) => {
    const numValue = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numValue);
      case 'percentage':
        return `${numValue.toFixed(1)}%`;
      default:
        return numValue.toLocaleString('pt-BR');
    }
  };

  const calculateTrend = () => {
    if (!previousValue || previousValue === 0) return null;
    
    const current = typeof value === 'string' ? parseFloat(value) : value;
    const previous = typeof previousValue === 'string' ? parseFloat(previousValue) : previousValue;
    
    const change = ((current - previous) / previous) * 100;
    
    if (change > 5) return { type: 'up', value: change };
    if (change < -5) return { type: 'down', value: Math.abs(change) };
    return { type: 'stable', value: Math.abs(change) };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.type) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    
    switch (trend.type) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="hover-scale transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          {title}
        </CardTitle>
        <div className="p-2 rounded-full bg-secondary/10">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          {formatValue(value)}
        </div>
        {trend && (
          <div className={`flex items-center space-x-2 text-xs mt-3 p-2 rounded-lg bg-muted/30 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">
              {trend.value.toFixed(1)}% vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};