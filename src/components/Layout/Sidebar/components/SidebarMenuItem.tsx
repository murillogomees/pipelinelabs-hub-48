import { MenuItem } from '../types';
import { SidebarMenuButton } from './SidebarMenuButton';
import { SidebarMenuLink } from './SidebarMenuLink';
import { SidebarSubmenu } from './SidebarSubmenu';

interface SidebarMenuItemProps {
  item: MenuItem;
  isExpanded: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export function SidebarMenuItem({ 
  item, 
  isExpanded, 
  collapsed, 
  onToggle,
  onNavigate 
}: SidebarMenuItemProps) {
  const hasSubmenu = item.submenu.length > 0;

  return (
    <div>
      <div className="px-2">
        {hasSubmenu ? (
          <SidebarMenuButton
            item={item}
            isExpanded={isExpanded}
            collapsed={collapsed}
            onToggle={onToggle}
          />
        ) : (
          <SidebarMenuLink
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        )}
      </div>

      <SidebarSubmenu
        submenu={item.submenu}
        isExpanded={isExpanded}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
    </div>
  );
}