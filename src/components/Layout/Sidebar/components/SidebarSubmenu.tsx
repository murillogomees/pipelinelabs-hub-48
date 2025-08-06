
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SubMenuItem } from '../types';

interface SidebarSubmenuProps {
  submenu: SubMenuItem[];
  isExpanded: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarSubmenu({ submenu, isExpanded, collapsed, onNavigate }: SidebarSubmenuProps) {
  return null;
}
