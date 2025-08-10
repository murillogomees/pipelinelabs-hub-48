
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Settings, 
  Database, 
  Shield, 
  Activity,
  Zap,
  FileText,
  Globe,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const adminSections = [
    {
      title: 'Usuários',
      description: 'Gerencie usuários do sistema',
      icon: Users,
      href: '/app/admin/usuarios',
      color: 'text-blue-600'
    },
    {
      title: 'Empresas',
      description: 'Gerencie empresas cadastradas',
      icon: Users,
      href: '/app/admin/empresas',
      color: 'text-blue-500'
    },
    {
      title: 'Níveis de Acesso',
      description: 'Gerencie permissões e níveis de acesso',
      icon: Shield,
      href: '/app/admin/access-levels',
      color: 'text-emerald-600'
    },
    {
      title: 'Integrações',
      description: 'Configure integrações disponíveis',
      icon: Settings,
      href: '/app/admin/integracoes',
      color: 'text-green-600'
    },
    {
      title: 'Notificações',
      description: 'Configure sistema de notificações',
      icon: Activity,
      href: '/app/admin/notificacoes',
      color: 'text-yellow-600'
    },
    {
      title: 'Backup e Restauração',
      description: 'Gerencie backups do sistema',
      icon: Database,
      href: '/app/admin/backup',
      color: 'text-purple-600'
    },
    {
      title: 'Cache',
      description: 'Monitore e gerencie cache',
      icon: Zap,
      href: '/app/admin/cache',
      color: 'text-orange-600'
    },
    {
      title: 'Compressão',
      description: 'Monitor de compressão HTTP',
      icon: FileText,
      href: '/app/admin/compressao',
      color: 'text-red-600'
    },
    {
      title: 'Monitoramento',
      description: 'Monitore performance do sistema',
      icon: Activity,
      href: '/app/admin/monitoramento',
      color: 'text-indigo-600'
    },
    {
      title: 'Versões',
      description: 'Gerenciamento de versões',
      icon: Settings,
      href: '/app/admin/versions',
      color: 'text-gray-600'
    },
    {
      title: 'Engenheiro de IA',
      description: 'Agente para análise e implementação assistida',
      icon: Sparkles,
      href: '/app/admin/funcao',
      color: 'text-indigo-700'
    },
    {
      title: 'Landing Page',
      description: 'Editor da página inicial',
      icon: Globe,
      href: '/app/admin/landing-page',
      color: 'text-cyan-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie configurações globais do sistema Pipeline Labs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Card key={section.href} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className={`w-5 h-5 ${section.color}`} />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {section.description}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to={section.href}>
                  Acessar
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
