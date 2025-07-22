
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
  Palette
} from 'lucide-react';

export const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    submenu: []
  },
  {
    title: 'Vendas',
    icon: ShoppingCart,
    path: '/vendas',
    submenu: [
      { title: 'Pedidos', path: '/vendas/pedidos' },
      { title: 'PDV', path: '/vendas/pdv' },
      { title: 'Propostas', path: '/vendas/propostas' }
    ]
  },
  {
    title: 'Produtos',
    icon: Package,
    path: '/produtos',
    submenu: [
      { title: 'Estoque', path: '/produtos/estoque' },
      { title: 'Categorias', path: '/produtos/categorias' }
    ]
  },
  {
    title: 'Compras',
    icon: ShoppingBag,
    path: '/compras',
    submenu: [
      { title: 'Cotações', path: '/compras/cotacoes' }
    ]
  },
  {
    title: 'Clientes',
    icon: Users,
    path: '/clientes',
    submenu: [
      { title: 'Fornecedores', path: '/clientes/fornecedores' }
    ]
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    path: '/financeiro',
    submenu: [
      { title: 'Contas a Pagar', path: '/financeiro/pagar' },
      { title: 'Contas a Receber', path: '/financeiro/receber' },
      { title: 'Conciliação', path: '/financeiro/conciliacao' }
    ]
  },
  {
    title: 'Notas Fiscais',
    icon: FileText,
    path: '/notas-fiscais',
    submenu: [
      { title: 'NFe', path: '/notas-fiscais/nfe' },
      { title: 'NFCe', path: '/notas-fiscais/nfce' },
      { title: 'NFSe', path: '/notas-fiscais/nfse' }
    ]
  },
  {
    title: 'Emissão Fiscal',
    icon: FileSpreadsheet,
    path: '/emissao-fiscal',
    submenu: []
  },
  {
    title: 'Produção',
    icon: Settings2,
    path: '/producao',
    submenu: [
      { title: 'Ordens de Serviço', path: '/producao/os' }
    ]
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    path: '/relatorios',
    submenu: []
  },
  {
    title: 'Integrações',
    icon: Zap,
    path: '/integracoes',
    submenu: []
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    submenu: [
      { title: 'Configuração NFE.io', path: '/configuracoes/nfe' }
    ]
  },
  {
    title: 'Administração',
    icon: UserCheck,
    path: '/admin',
    adminOnly: true,
    submenu: [
      { title: 'Planos', path: '/admin/planos' },
      { title: 'Usuários', path: '/admin/usuarios' },
      { title: 'Integrações', path: '/admin/integracoes' },
      { title: 'Notificações', path: '/admin/notificacoes' },
      { title: 'Backup', path: '/admin/backup' },
      { title: 'Integração ERP', path: '/admin/integracao-erp' },
      { title: 'Logs de Auditoria', path: '/admin/audit-logs' },
      { title: 'Landing Page', path: '/admin/landing-page' }
    ]
  }
];
