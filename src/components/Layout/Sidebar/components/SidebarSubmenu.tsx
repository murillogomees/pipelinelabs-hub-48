import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SubMenuItem } from '../types';

interface SidebarSubmenuProps {
  submenu: SubMenuItem[];
  isExpanded: boolean;
  collapsed: boolean;
}

export function SidebarSubmenu({ submenu, isExpanded, collapsed }: SidebarSubmenuProps) {
  const location = useLocation();

  if (!isExpanded || collapsed) return null;

  return (
    <div className="ml-6 mt-1 space-y-1">
      {submenu.map((subItem) => (
        <NavLink
          key={subItem.path}
          to={subItem.path}
          className={({ isActive }) => cn(
            "block px-3 py-2 text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors",
            (isActive || location.pathname.startsWith(subItem.path)) && "text-sidebar-primary bg-sidebar-accent font-medium"
          )}
        >
          {subItem.title}
        </NavLink>
      ))}
    </div>
  );
}