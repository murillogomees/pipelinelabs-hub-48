import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
  submenu: SubMenuItem[];
  adminOnly?: boolean;
}

export interface SubMenuItem {
  title: string;
  path: string;
}

export interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}