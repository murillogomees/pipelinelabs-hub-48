
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SubMenuItem } from '../types';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarSubmenuProps {
  submenu: SubMenuItem[];
  isExpanded: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarSubmenu({ submenu, isExpanded, collapsed, onNavigate }: SidebarSubmenuProps) {
  const location = useLocation();
  const { isSuperAdmin } = usePermissions();

  if (!isExpanded || collapsed || !submenu.length) {
    return null;
  }

  return (
    <div className="mt-1 ml-6 space-y-1">
      {submenu
        .filter(item => !item.superAdminOnly || isSuperAdmin)
        .map((item) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
        
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "block px-3 py-2 text-sm rounded-md transition-colors",
              isActive 
                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            {item.title}
          </NavLink>
        );
      })}
    </div>
  );
}
