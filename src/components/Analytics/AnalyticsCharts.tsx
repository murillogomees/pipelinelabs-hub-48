import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface EventsByDayProps {
  data: Record<string, number>;
}

export const EventsByDayChart = ({ data }: EventsByDayProps) => {
  const chartData = Object.entries(data).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('pt-BR'),
    events: count
  }));

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          Eventos por Dia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="events" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface TopEventsProps {
  data: Array<{ event_name: string; count: number }>;
}

export const TopEventsChart = ({ data }: TopEventsProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          Eventos Mais Frequentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 8)} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="event_name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                fontSize={10}
                stroke="hsl(var(--muted-foreground))"
                interval={0}
              />
              <YAxis 
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface DeviceBreakdownProps {
  data: Record<string, number>;
}

export const DeviceBreakdownChart = ({ data }: DeviceBreakdownProps) => {
  const COLORS = [
    'hsl(var(--primary))', 
    'hsl(var(--secondary))', 
    'hsl(var(--accent))',
    'hsl(var(--muted-foreground))',
    'hsl(var(--destructive))'
  ];
  
  const chartData = Object.entries(data).map(([device, count]) => ({
    name: device.charAt(0).toUpperCase() + device.slice(1),
    value: count
  }));

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
          Dispositivos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius="75%"
                fill="#8884d8"
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface RouteBreakdownProps {
  data: Record<string, number>;
}

export const RouteBreakdownChart = ({ data }: RouteBreakdownProps) => {
  const chartData = Object.entries(data)
    .map(([route, count]) => ({
      route: route.replace('/', '') || 'Home',
      visits: count
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10);

  return (
    <Card className="transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
          Páginas Mais Visitadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                type="number" 
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                dataKey="route" 
                type="category" 
                width={100}
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="visits" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};