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
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Eventos por Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} />
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
    <Card>
      <CardHeader>
        <CardTitle>Eventos Mais Frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="event_name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
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
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];
  
  const chartData = Object.entries(data).map(([device, count]) => ({
    name: device,
    value: count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispositivos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
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
    <Card>
      <CardHeader>
        <CardTitle>Páginas Mais Visitadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="route" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="visits" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};