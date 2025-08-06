
export interface MenuItem {
  id: string;
  title: string;
  path: string;
  href: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  order: number;
  submenu: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  title: string;
  path: string;
  href: string;
  order: number;
  superAdminOnly?: boolean;
}

export interface SidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}
