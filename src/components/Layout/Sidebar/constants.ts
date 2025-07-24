
import { 
  Home, 
  ShoppingCart, 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  BarChart3, 
  Zap, 
  Globe,
  Settings2,
  UserCheck,
  CreditCard,
  Bell,
  HardDrive,
  Building2,
  Type,
  Shield,
  Palette,
  Activity,
  GitBranch
} from 'lucide-react';

export const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/app/dashboard',
    submenu: []
  },
  {
    title: 'Vendas',
    icon: ShoppingCart,
    path: '/app/vendas',
    submenu: []
  },
  {
    title: 'Produtos',
    icon: Package,
    path: '/app/produtos',
    submenu: []
  },
  {
    title: 'Compras',
    icon: ShoppingBag,
    path: '/app/compras',
    submenu: []
  },
  {
    title: 'Clientes',
    icon: Users,
    path: '/app/clientes',
    submenu: []
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    path: '/app/financeiro',
    submenu: []
  },
  {
    title: 'Notas Fiscais',
    icon: FileText,
    path: '/app/notas-fiscais',
    submenu: []
  },
  {
    title: 'Produção',
    icon: Settings2,
    path: '/app/producao',
    submenu: []
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    path: '/app/relatorios',
    submenu: []
  },
  {
    title: 'Analytics',
    icon: Activity,
    path: '/app/analytics',
    submenu: []
  },
  {
    title: 'Marketplace Canais',
    icon: Globe,
    path: '/app/marketplace-channels',
    submenu: []
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/app/configuracoes',
    submenu: [
      { title: 'Empresa', path: '/app/configuracoes', icon: Building2 },
      
      { title: 'Meus Dados (LGPD)', path: '/app/user/dados-pessoais' }
    ]
  },
  {
    title: 'Administração',
    icon: UserCheck,
    path: '/app/admin',
    adminOnly: true,
    submenu: [
      { title: 'Planos', path: '/app/admin/planos' },
      { title: 'Usuários', path: '/app/admin/usuarios' },
      
      { title: 'Integrações', path: '/app/admin/integracoes' },
      { title: 'Notificações', path: '/app/admin/notificacoes' },
      { title: 'Backup', path: '/app/admin/backup' },
      { title: 'Cache', path: '/app/admin/cache' },
      { title: 'Compressão', path: '/app/admin/compressao' },
      { title: 'Monitoramento', path: '/app/admin/monitoramento' },
      { title: 'Versões', path: '/app/admin/versions', icon: GitBranch },
      { title: 'Stripe', path: '/app/admin/stripe', icon: CreditCard },
      { title: 'Logs de Auditoria', path: '/app/admin/audit-logs' },
      { title: 'Landing Page', path: '/app/admin/landing-page' }
    ]
  }
];
