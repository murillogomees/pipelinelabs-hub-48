
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MenuItem } from '../types';

interface SidebarMenuLinkProps {
  item: MenuItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarMenuLink({ item, collapsed, onNavigate }: SidebarMenuLinkProps) {
  const location = useLocation();
  const Icon = item.icon;
  const isActive = location.pathname === item.path;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
        collapsed && "justify-center",
        isActive 
          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0",
        isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/80"
      )} />
      {!collapsed && (
        <span className={cn(
          "text-sm font-medium",
          isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground"
        )}>
          {item.title}
        </span>
      )}
    </NavLink>
  );
}
