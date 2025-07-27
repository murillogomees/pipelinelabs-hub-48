
import React from 'react';
import { AdminPageLayout } from '@/components/Admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  Database, 
  Server, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  Eye
} from 'lucide-react';

// Mock data para demonstração
const mockSystemMetrics = {
  activeUsers: 127,
  totalCompanies: 45,
  dbConnections: 8,
  serverHealth: 'healthy',
  uptime: '99.9%',
  responseTime: '245ms'
};

const mockEvents = [
  {
    id: '1',
    user_id: 'user1',
    event_name: 'user_login',
    route: '/app/dashboard',
    duration_ms: 1200,
    created_at: '2024-01-20T10:00:00Z',
    meta: { ip: '192.168.1.1' }
  },
  {
    id: '2',
    user_id: 'user2',
    event_name: 'product_created',
    route: '/app/produtos',
    duration_ms: 800,
    created_at: '2024-01-20T09:30:00Z',
    meta: { product_id: 'prod123' }
  }
];

const mockCompanies = [
  {
    id: '1',
    name: 'Empresa A',
    document: '12345678901',
    email: 'contato@empresaa.com',
    phone: '11999999999',
    created_at: '2024-01-01T00:00:00Z',
    city: 'São Paulo',
    state: 'SP',
    address: 'Rua A, 123',
    zipcode: '01000-000',
    fiscal_email: 'fiscal@empresaa.com',
    legal_name: 'Empresa A Ltda',
    legal_representative: 'João Silva',
    municipal_registration: '123456',
    state_registration: '123456789',
    tax_regime: 'simples_nacional',
    trade_name: 'Empresa A'
  }
];

const AdminMonitoramento: React.FC = () => {
  return (
    <AdminPageLayout
      title="Monitoramento do Sistema"
      description="Monitore a saúde e performance do sistema em tempo real"
    >
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSystemMetrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSystemMetrics.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                +3 novas empresas este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conexões DB</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSystemMetrics.dbConnections}</div>
              <p className="text-xs text-muted-foreground">
                De 20 conexões máximas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSystemMetrics.responseTime}</div>
              <p className="text-xs text-muted-foreground">
                Média das últimas 24h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Servidor Principal</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Banco de Dados</span>
                <Badge className="bg-green-100 text-green-800">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cache Redis</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Externa</span>
                <Badge className="bg-yellow-100 text-yellow-800">Lento</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eventos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Eventos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.event_name}</Badge>
                      <span className="text-sm text-muted-foreground">{event.route}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.duration_ms}ms • {new Date(event.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empresas Cadastradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Empresas Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{company.name}</span>
                      <Badge variant="outline">{company.document}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {company.city}, {company.state} • {company.email}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alerta:</strong> Detectada lentidão na API externa. Monitorando...
          </AlertDescription>
        </Alert>
      </div>
    </AdminPageLayout>
  );
};

export default AdminMonitoramento;
