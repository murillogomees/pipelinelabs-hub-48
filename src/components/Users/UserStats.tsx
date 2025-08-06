import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Building2, 
  User,
  TrendingUp,
  Clock
} from 'lucide-react';
import { User as UserType } from '@/hooks/useUsersQuery';

interface UserStatsProps {
  users: UserType[];
}

export function UserStats({ users }: UserStatsProps) {
  const stats = React.useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const inactive = total - active;
    
    const superAdmins = users.filter(u => u.role === 'super_admin').length;
    const contratantes = users.filter(u => u.role === 'contratante').length;
    const operadores = users.filter(u => u.role === 'operador').length;
    
    const companies = new Set(users.map(u => u.company_id).filter(Boolean)).size;
    
    // Usuários que fizeram login nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyActive = users.filter(u => 
      u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo
    ).length;

    return {
      total,
      active,
      inactive,
      superAdmins,
      contratantes,
      operadores,
      companies,
      recentlyActive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
      recentlyActivePercentage: total > 0 ? Math.round((recentlyActive / total) * 100) : 0
    };
  }, [users]);

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.total,
      icon: Users,
      description: `${stats.active} ativos, ${stats.inactive} inativos`,
      color: 'text-primary'
    },
    {
      title: 'Usuários Ativos',
      value: stats.active,
      icon: UserCheck,
      description: `${stats.activePercentage}% do total`,
      color: 'text-success'
    },
    {
      title: 'Empresas',
      value: stats.companies,
      icon: Building2,
      description: 'Empresas com usuários',
      color: 'text-info'
    },
    {
      title: 'Atividade Recente',
      value: stats.recentlyActive,
      icon: TrendingUp,
      description: 'Login nos últimos 30 dias',
      color: 'text-warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Distribuição por Tipo de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" />
                <span className="font-medium">Super Admins</span>
              </div>
              <Badge variant="destructive">{stats.superAdmins}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">Contratantes</span>
              </div>
              <Badge variant="default">{stats.contratantes}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-secondary" />
                <span className="font-medium">Operadores</span>
              </div>
              <Badge variant="secondary">{stats.operadores}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Insights */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Insights de Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Taxa de ativação:</span>
                  <span className="font-medium">{stats.activePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Atividade recente:</span>
                  <span className="font-medium">{stats.recentlyActivePercentage}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Usuários inativos:</span>
                  <span className="font-medium text-destructive">{stats.inactive}</span>
                </div>
                <div className="flex justify-between">
                  <span>Média por empresa:</span>
                  <span className="font-medium">
                    {stats.companies > 0 ? Math.round(stats.total / stats.companies) : 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}