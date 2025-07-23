import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

export const AnalyticsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon 
}: AnalyticsCardProps) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className="hover-scale transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          {title}
        </CardTitle>
        <div className="p-2 rounded-full bg-primary/10">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </div>
        {change && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${changeColors[changeType]}`}>
            <span className="font-medium">{change}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};