
import React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { 
    title: 'Dashboard', 
    path: '/app/dashboard', 
    icon: LayoutDashboard,
    keywords: ['dashboard', 'home', 'início']
  },
  { 
    title: 'Produtos', 
    path: '/app/produtos', 
    icon: Package,
    keywords: ['produtos', 'products', 'estoque', 'inventory']
  },
  { 
    title: 'Vendas', 
    path: '/app/vendas', 
    icon: ShoppingCart,
    keywords: ['vendas', 'sales', 'pedidos', 'orders']
  },
  { 
    title: 'Clientes', 
    path: '/app/clientes', 
    icon: Users,
    keywords: ['clientes', 'customers', 'users', 'usuários']
  },
  { 
    title: 'Relatórios', 
    path: '/app/relatorios', 
    icon: FileText,
    keywords: ['relatórios', 'reports', 'analytics']
  },
  { 
    title: 'Analytics', 
    path: '/app/analytics', 
    icon: BarChart3,
    keywords: ['analytics', 'análise', 'estatísticas', 'stats']
  },
  { 
    title: 'Configurações', 
    path: '/app/configuracoes', 
    icon: Settings,
    keywords: ['configurações', 'settings', 'config']
  },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar páginas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {menuItems.map((item) => (
            <CommandItem
              key={item.path}
              onSelect={() => handleSelect(item.path)}
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
