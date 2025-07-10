import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const Icon = item.icon;
  const hasSubmenu = item.submenu.length > 0;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors",
        collapsed && "justify-center"
      )}
    >
      <Icon className="w-5 h-5 text-sidebar-foreground/80 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left text-sm font-medium text-sidebar-foreground">
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