
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
  Type
} from 'lucide-react';

export const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    expanded: false,
    children: []
  },
  {
    title: 'Vendas',
    icon: ShoppingCart,
    path: '/vendas',
    expanded: false,
    children: [
      { title: 'Pedidos', path: '/vendas/pedidos' },
      { title: 'PDV', path: '/vendas/pdv' },
      { title: 'Propostas', path: '/vendas/propostas' }
    ]
  },
  {
    title: 'Produtos',
    icon: Package,
    path: '/produtos',
    expanded: false,
    children: [
      { title: 'Estoque', path: '/produtos/estoque' },
      { title: 'Categorias', path: '/produtos/categorias' }
    ]
  },
  {
    title: 'Compras',
    icon: ShoppingBag,
    path: '/compras',
    expanded: false,
    children: [
      { title: 'Cotações', path: '/compras/cotacoes' }
    ]
  },
  {
    title: 'Clientes',
    icon: Users,
    path: '/clientes',
    expanded: false,
    children: [
      { title: 'Fornecedores', path: '/clientes/fornecedores' }
    ]
  },
  {
    title: 'Financeiro',
    icon: DollarSign,
    path: '/financeiro',
    expanded: false,
    children: [
      { title: 'Contas a Pagar', path: '/financeiro/pagar' },
      { title: 'Contas a Receber', path: '/financeiro/receber' },
      { title: 'Conciliação', path: '/financeiro/conciliacao' }
    ]
  },
  {
    title: 'Notas Fiscais',
    icon: FileText,
    path: '/notas-fiscais',
    expanded: false,
    children: [
      { title: 'NFe', path: '/notas-fiscais/nfe' },
      { title: 'NFCe', path: '/notas-fiscais/nfce' },
      { title: 'NFSe', path: '/notas-fiscais/nfse' }
    ]
  },
  {
    title: 'Emissão Fiscal',
    icon: FileSpreadsheet,
    path: '/emissao-fiscal',
    expanded: false,
    children: []
  },
  {
    title: 'Produção',
    icon: Settings2,
    path: '/producao',
    expanded: false,
    children: [
      { title: 'Ordens de Serviço', path: '/producao/os' }
    ]
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    path: '/relatorios',
    expanded: false,
    children: []
  },
  {
    title: 'Integrações',
    icon: Zap,
    path: '/integracoes',
    expanded: false,
    children: []
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    expanded: false,
    children: [
      { title: 'Configuração NFE.io', path: '/configuracoes/nfe' }
    ]
  },
  {
    title: 'Administração',
    icon: UserCheck,
    path: '/admin',
    expanded: false,
    adminOnly: true,
    children: [
      { title: 'Planos', path: '/admin/planos' },
      { title: 'Usuários', path: '/admin/usuarios' },
      { title: 'Integrações', path: '/admin/integracoes' },
      { title: 'Notificações', path: '/admin/notificacoes' },
      { title: 'Backup', path: '/admin/backup' },
      { title: 'Integração ERP', path: '/admin/integracao-erp' }
    ]
  }
];
