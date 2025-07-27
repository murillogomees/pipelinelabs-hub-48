
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings, 
  Zap,
  Factory,
  Receipt,
  ShieldCheck,
  Link,
  Webhook,
  Bell,
  ShoppingBag,
  TrendingUp,
  UserCog,
  Shield,
  Database,
  Activity,
  MessageSquare,
  Calendar,
  HardDrive,
  Wrench,
  Gamepad2,
  Search,
  Sparkles
} from 'lucide-react';

export const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/app/dashboard',
  },
  {
    title: 'Comercial',
    icon: ShoppingCart,
    submenu: [
      {
        title: 'Vendas',
        path: '/app/vendas',
        icon: ShoppingCart,
      },
      {
        title: 'Produtos',
        path: '/app/produtos',
        icon: Package,
      },
      {
        title: 'Clientes',
        path: '/app/clientes',
        icon: Users,
      },
      {
        title: 'Compras',
        path: '/app/compras',
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    path: '/app/financeiro',
  },
  {
    title: 'Fiscal',
    icon: FileText,
    submenu: [
      {
        title: 'Notas Fiscais',
        path: '/app/notas-fiscais',
        icon: Receipt,
      },
      {
        title: 'Configuração NFe',
        path: '/app/configuracao-nfe',
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: 'Operacional',
    icon: Factory,
    submenu: [
      {
        title: 'Produção',
        path: '/app/producao',
        icon: Factory,
      },
      {
        title: 'Estoque',
        path: '/app/estoque',
        icon: Package,
      },
    ],
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    submenu: [
      {
        title: 'Relatórios',
        path: '/app/relatorios',
        icon: BarChart3,
      },
      {
        title: 'Analytics',
        path: '/app/analytics',
        icon: TrendingUp,
      },
    ],
  },
  {
    title: 'Integrações',
    icon: Link,
    submenu: [
      {
        title: 'Canais de Venda',
        path: '/app/marketplace-channels',
        icon: Webhook,
      },
      {
        title: 'Integrações',
        path: '/app/integracoes',
        icon: Link,
      },
      {
        title: 'Configurações',
        path: '/app/configuracoes-integracoes',
        icon: Settings,
      },
    ],
  },
  {
    title: 'Notificações',
    icon: Bell,
    path: '/app/notificacoes',
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/app/configuracoes',
  },
  {
    title: 'Administração',
    icon: Shield,
    adminOnly: true,
    submenu: [
      {
        title: 'Painel Admin',
        path: '/app/admin',
        icon: Shield,
      },
      {
        title: 'Usuários',
        path: '/app/admin/usuarios',
        icon: UserCog,
      },
      {
        title: 'Níveis de Acesso',
        path: '/app/admin/niveis-acesso',
        icon: Shield,
      },
      {
        title: 'Logs de Auditoria',
        path: '/app/admin/audit-logs',
        icon: Activity,
      },
      {
        title: 'Integrações',
        path: '/app/admin/integracoes',
        icon: Link,
      },
      {
        title: 'Configuração NFe',
        path: '/app/admin/nfe-config',
        icon: Receipt,
      },
      {
        title: 'Versões',
        path: '/app/admin/versions',
        icon: Database,
      },
      {
        title: 'Monitoramento',
        path: '/app/admin/monitoramento',
        icon: Activity,
      },
      {
        title: 'SLA',
        path: '/app/admin/sla',
        icon: FileText,
      },
      {
        title: 'Segurança',
        path: '/app/admin/seguranca',
        icon: Shield,
      },
      {
        title: 'Notificações',
        path: '/app/admin/notificacoes',
        icon: Bell,
      },
      {
        title: 'Backup',
        path: '/app/admin/backup',
        icon: HardDrive,
      },
      {
        title: 'Cache',
        path: '/app/admin/cache',
        icon: Database,
      },
      {
        title: 'Compressão',
        path: '/app/admin/compressao',
        icon: Wrench,
      },
      {
        title: 'Prompt Generator',
        path: '/app/admin/prompt-generator',
        icon: Sparkles,
      },
      {
        title: 'Landing Page',
        path: '/app/admin/landing-page',
        icon: Gamepad2,
      },
      {
        title: 'Auditoria',
        path: '/app/admin/auditoria',
        icon: Search,
      },
    ],
  },
];
