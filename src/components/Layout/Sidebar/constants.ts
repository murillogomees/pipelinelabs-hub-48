
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Building2, 
  Warehouse, 
  CreditCard, 
  FileText, 
  Wrench, 
  ClipboardList, 
  BarChart3, 
  Link, 
  Settings, 
  Shield,
  UserCheck,
  Building
} from "lucide-react";
import type { MenuItem } from "./types";

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/app/dashboard",
    order: 1
  },
  {
    id: "vendas",
    label: "Vendas",
    icon: ShoppingCart,
    href: "/app/vendas",
    order: 2
  },
  {
    id: "produtos",
    label: "Produtos",
    icon: Package,
    href: "/app/produtos",
    order: 3
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: Users,
    href: "/app/clientes",
    order: 4
  },
  {
    id: "compras",
    label: "Compras",
    icon: ShoppingCart,
    href: "/app/compras",
    order: 5
  },
  {
    id: "estoque",
    label: "Estoque",
    icon: Warehouse,
    href: "/app/estoque",
    order: 6
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: CreditCard,
    href: "/app/financeiro",
    order: 7
  },
  {
    id: "notas_fiscais",
    label: "Notas Fiscais",
    icon: FileText,
    href: "/app/notas-fiscais",
    order: 8
  },
  {
    id: "producao",
    label: "Produção",
    icon: Wrench,
    href: "/app/producao",
    order: 9
  },
  {
    id: "contratos",
    label: "Contratos",
    icon: ClipboardList,
    href: "/app/contratos",
    order: 10
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: BarChart3,
    href: "/app/relatorios",
    order: 11
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/app/analytics",
    order: 12
  },
  {
    id: "marketplace_canais",
    label: "Marketplace Canais",
    icon: Link,
    href: "/app/marketplace-channels",
    order: 13
  },
  {
    id: "integracoes",
    label: "Integrações",
    icon: Link,
    href: "/app/integracoes",
    order: 14
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    href: "/app/configuracoes",
    order: 15
  },
  {
    id: "admin",
    label: "Administração",
    icon: Shield,
    href: "#",
    order: 100,
    submenu: [
      {
        id: "admin-usuarios",
        label: "Usuários e Empresas",
        icon: UserCheck,
        href: "/app/admin/usuarios",
        order: 1
      },
      {
        id: "admin-niveis-acesso",
        label: "Níveis de Acesso",
        icon: Shield,
        href: "/app/admin/niveis-acesso",
        order: 2
      }
    ]
  }
];
