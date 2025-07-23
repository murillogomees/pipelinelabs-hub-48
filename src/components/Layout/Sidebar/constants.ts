
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
  FileSpreadsheet,
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
    submenu: [
      { title: 'Pedidos', path: '/app/vendas/pedidos' },
      { title: 'PDV', path: '/app/vendas/pdv' },
      { title: 'Propostas', path: '/app/vendas/propostas' }
    ]
  },
  {
    title: 'Produtos',
    icon: Package,
    path: '/app/produtos',
    submenu: [
      { title: 'Estoque', path: '/app/produtos/estoque' },
      { title: 'Categorias', path: '/app/produtos/categorias' }
    ]
  },
  {
    title: 'Compras',
    icon: ShoppingBag,
    path: '/app/compras',
    submenu: [
      { title: 'Cotações', path: '/app/compras/cotacoes' }
    ]
  },
  {
    title: 'Clientes',
    icon: Users,
    path: '/app/clientes',
    submenu: [
      { title: 'Fornecedores', path: '/app/clientes/fornecedores' }
    ]
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    path: '/app/financeiro',
    submenu: [
      { title: 'Contas a Pagar', path: '/app/financeiro/pagar' },
      { title: 'Contas a Receber', path: '/app/financeiro/receber' },
      { title: 'Conciliação', path: '/app/financeiro/conciliacao' }
    ]
  },
  {
    title: 'Notas Fiscais',
    icon: FileText,
    path: '/app/notas-fiscais',
    submenu: [
      { title: 'NFe', path: '/app/notas-fiscais/nfe' },
      { title: 'NFCe', path: '/app/notas-fiscais/nfce' },
      { title: 'NFSe', path: '/app/notas-fiscais/nfse' }
    ]
  },
  {
    title: 'Emissão Fiscal',
    icon: FileSpreadsheet,
    path: '/app/emissao-fiscal',
    submenu: []
  },
  {
    title: 'Produção',
    icon: Settings2,
    path: '/app/producao',
    submenu: [
      { title: 'Ordens de Serviço', path: '/app/producao/os' }
    ]
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
    title: 'Integrações',
    icon: Zap,
    path: '/app/integracoes',
    submenu: []
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/app/configuracoes',
    submenu: [
      { title: 'Configuração NFE.io', path: '/app/configuracoes/nfe' },
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
      { title: 'Logs de Auditoria', path: '/app/admin/audit-logs' },
      { title: 'Landing Page', path: '/app/admin/landing-page' }
    ]
  }
];
