
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronDown,
  ChevronRight,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
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
      { title: 'NFSe', path: '/notas-fiscais/nfse' }
    ]
  },
  {
    title: 'Produção',
    icon: Wrench,
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
    icon: Puzzle,
    path: '/integracoes',
    submenu: []
  },
  {
    title: 'Admin',
    icon: Building2,
    path: '/admin',
    submenu: [
      { title: 'Planos', path: '/admin/planos' },
      { title: 'Usuários', path: '/admin/usuarios' },
      { title: 'Whitelabel', path: '/admin/whitelabel' }
    ]
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    submenu: []
  }
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  // Expande automaticamente apenas o menu ativo e fecha os demais
  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find(item => 
      item.submenu.some(sub => currentPath.startsWith(sub.path)) ||
      currentPath === item.path
    );
    
    if (activeMenuItem && activeMenuItem.submenu.length > 0) {
      // Mantém apenas o item ativo expandido
      setExpandedItems([activeMenuItem.title]);
    } else {
      // Se estamos em uma rota principal sem submenu, fecha todos
      setExpandedItems([]);
    }
  }, [location.pathname]);

  const toggleExpanded = (title: string) => {
    if (collapsed) return;
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className={cn(
      "bg-slate-900 text-white transition-all duration-300 flex flex-col min-h-screen sticky top-0",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Pipeline Labs</h1>
              <p className="text-xs text-slate-400">ERP Inteligente</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.title);
          const hasSubmenu = item.submenu.length > 0;

          return (
            <div key={item.title}>
              {/* Main Item */}
              <div className="px-2">
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors",
                      collapsed && "justify-center"
                    )}
                  >
                    <Icon className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                        {hasSubmenu && (
                          isExpanded ? 
                            <ChevronDown className="w-4 h-4 text-slate-400" /> :
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors",
                      isActive && "bg-blue-600 hover:bg-blue-700",
                      collapsed && "justify-center"
                    )}
                  >
                    <Icon className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </NavLink>
                )}
              </div>

              {/* Submenu */}
              {hasSubmenu && isExpanded && !collapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) => cn(
                        "block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors",
                        (isActive || location.pathname.startsWith(subItem.path)) && "text-blue-400 bg-slate-800"
                      )}
                    >
                      {subItem.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
