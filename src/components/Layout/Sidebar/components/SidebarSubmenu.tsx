
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
  const location = useLocation();

  if (!isExpanded || collapsed) return null;

  return (
    <div className="ml-6 mt-1 space-y-1">
      {submenu.map((subItem) => {
        const isActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path);
        
        return (
          <NavLink
            key={subItem.path}
            to={subItem.path}
            onClick={onNavigate}
            className={cn(
              "block px-3 py-2 text-sm transition-colors rounded-lg",
              isActive
                ? "text-sidebar-primary bg-sidebar-accent font-medium border-l-2 border-sidebar-primary"
                : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
            )}
          >
            {subItem.title}
          </NavLink>
        );
      })}
    </div>
  );
}
