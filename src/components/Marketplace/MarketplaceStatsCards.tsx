import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Settings, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Clock 
} from 'lucide-react';
import { MarketplaceSyncLog } from '@/hooks/useMarketplaceIntegration';

interface StatsData {
  total: number;
  active: number;
  enabled: number;
  connected: number;
  maintenance: number;
}

interface MarketplaceStatsCardsProps {
  stats: StatsData;
  recentActivity: MarketplaceSyncLog[];
}

export const MarketplaceStatsCards = ({ stats, recentActivity }: MarketplaceStatsCardsProps) => {
  const successRate = recentActivity.length > 0 
    ? Math.round((recentActivity.filter(log => log.status === 'success').length / recentActivity.length) * 100)
    : 0;

  const totalSyncs = recentActivity.length;
  const lastSync = recentActivity[0]?.created_at;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Canais Disponíveis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Canais Disponíveis</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            {stats.maintenance > 0 && `${stats.maintenance} em manutenção`}
          </p>
          <div className="mt-2">
            <Badge 
              variant={stats.active > 0 ? "default" : "secondary"}
              className="text-xs"
            >
              {stats.active > 0 ? "Disponível" : "Indisponível"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Canais Habilitados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Canais Habilitados</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.enabled}</div>
          <p className="text-xs text-muted-foreground">
            Ativados para sua empresa
          </p>
          <div className="mt-2">
            <Badge 
              variant={stats.enabled > 0 ? "default" : "outline"}
              className="text-xs"
            >
              {stats.enabled > 0 ? `${stats.enabled} Ativo${stats.enabled > 1 ? 's' : ''}` : "Nenhum ativo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Integrações Conectadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Integrações Ativas</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.connected}</div>
          <p className="text-xs text-muted-foreground">
            Sincronizando automaticamente
          </p>
          <div className="mt-2">
            <Badge 
              variant={stats.connected > 0 ? "default" : "secondary"}
              className={`text-xs ${stats.connected > 0 ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {stats.connected > 0 ? "Conectado" : "Desconectado"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Status de Sincronização */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sincronização</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Taxa de sucesso ({totalSyncs} operações)
          </p>
          <div className="mt-2 flex items-center space-x-1">
            {lastSync ? (
              <>
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {new Date(lastSync).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </>
            ) : (
              <Badge variant="outline" className="text-xs">
                Sem atividade
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};