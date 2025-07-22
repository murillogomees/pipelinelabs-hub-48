import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  FileText, 
  Settings, 
  BarChart3,
  Wrench,
  Puzzle,
  Building2,
  ShoppingBag
} from 'lucide-react';
import { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/',
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
      { title: 'Pedidos de Compra', path: '/compras' },
      { title: 'Cotações', path: '/compras/cotacoes' }
    ]
  },
  {
    title: 'Clientes',
    icon: Users,
    path: '/clientes',
    submenu: [
      { title: 'Clientes', path: '/clientes' },
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
      { title: 'NFSe', path: '/notas-fiscais/nfse' },
      { title: 'Emissão Fiscal', path: '/emissao-fiscal' }
    ]
  },
  {
    title: 'Produção',
    icon: Wrench,
    path: '/producao',
    submenu: [
      { title: 'Produção', path: '/producao' },
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
    icon: Puzzle,
    path: '/integracoes',
    submenu: [],
    adminOnly: false
  },
  {
    title: 'Admin',
    icon: Building2,
    path: '/admin',
    submenu: [
      { title: 'Painel Geral', path: '/admin' },
      { title: 'Planos', path: '/admin/planos' },
      { title: 'Usuários', path: '/admin/usuarios' },
      { title: 'Integrações', path: '/admin/integracoes' },
      { title: 'Notificações', path: '/admin/notificacoes' },
      { title: 'Integração ERP', path: '/admin/integracao-erp' }
    ],
    adminOnly: true
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    submenu: [
      { title: 'Configuração NFE.io', path: '/configuracoes/nfe' }
    ]
  }
];