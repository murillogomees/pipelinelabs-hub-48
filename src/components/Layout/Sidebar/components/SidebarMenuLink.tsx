import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MenuItem } from '../types';

interface SidebarMenuLinkProps {
  item: MenuItem;
  collapsed: boolean;
}

export function SidebarMenuLink({ item, collapsed }: SidebarMenuLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors",
        isActive && "bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground",
        !isActive && "text-sidebar-foreground",
        collapsed && "justify-center"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0",
        "text-sidebar-foreground/80"
      )} />
      {!collapsed && (
        <span className="text-sm font-medium">{item.title}</span>
      )}
    </NavLink>
  );
}