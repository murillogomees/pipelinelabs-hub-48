import { cn } from '@/lib/utils';
import { SidebarProps } from './types';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarMenuItem } from './components/SidebarMenuItem';
import { useSidebarState } from './hooks/useSidebarState';
import { menuItems } from './constants';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  const { expandedItems, toggleExpanded } = useSidebarState();
  const { isAdmin } = useAuth();

  return (
    <div className={cn(
      "bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col min-h-screen sticky top-0",
      collapsed ? "w-16" : "w-64"
    )}>
      <SidebarHeader collapsed={collapsed} />

      <nav className="flex-1 py-4">
        {menuItems
          .filter(item => !item.adminOnly || isAdmin)
          .map((item) => {
            const isExpanded = expandedItems.includes(item.title);

            return (
              <SidebarMenuItem
                key={item.title}
                item={item}
                isExpanded={isExpanded}
                collapsed={collapsed}
                onToggle={() => toggleExpanded(item.title, collapsed)}
                onNavigate={onNavigate}
              />
            );
          })}
      </nav>
    </div>
  );
}