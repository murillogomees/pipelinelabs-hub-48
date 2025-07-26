
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { MenuItem } from '../types';

interface SidebarMenuButtonProps {
  item: MenuItem;
  isExpanded: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarMenuButton({ 
  item, 
  isExpanded, 
  collapsed, 
  onToggle 
}: SidebarMenuButtonProps) {
  const location = useLocation();
  const Icon = item.icon;
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActiveSection = item.submenu?.some(sub => location.pathname.startsWith(sub.path)) || location.pathname === item.path;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
        collapsed && "justify-center",
        isActiveSection 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0",
        isActiveSection ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/80"
      )} />
      {!collapsed && (
        <>
          <span className={cn(
            "flex-1 text-left text-sm font-medium",
            isActiveSection ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
          )}>
            {item.title}
          </span>
          {hasSubmenu && (
            isExpanded ? 
              <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" /> :
              <ChevronRight className="w-4 h-4 text-sidebar-foreground/60" />
          )}
        </>
      )}
    </button>
  );
}
