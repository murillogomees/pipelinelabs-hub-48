
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { PipelineLabsLogo } from './PipelineLabsLogo';
import { menuItems } from './Sidebar/constants';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  // Auto-expand group containing active route
  React.useEffect(() => {
    const activeItem = menuItems.find(item => 
      item.submenu?.some(sub => location.pathname.startsWith(sub.path)) ||
      location.pathname === item.path
    );
    
    if (activeItem && activeItem.submenu?.length > 0) {
      setOpenGroups(prev => 
        prev.includes(activeItem.title) ? prev : [...prev, activeItem.title]
      );
    }
  }, [location.pathname]);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <PipelineLabsLogo size={state === 'collapsed' ? 'sm' : 'md'} showText={state !== 'collapsed'} />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => !item.adminOnly || isAdmin || isSuperAdmin)
                .map((item) => {
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isExpanded = openGroups.includes(item.title);
                  const isActive = location.pathname === item.path;
                  const isActiveSection = item.submenu?.some(sub => location.pathname.startsWith(sub.path));

                  return (
                    <SidebarMenuItem key={item.id}>
                      {hasSubmenu ? (
                        <>
                          <SidebarMenuButton
                            onClick={() => toggleGroup(item.title)}
                            isActive={isActiveSection}
                            className="w-full"
                          >
                            <item.icon />
                            <span>{item.title}</span>
                            {isExpanded ? (
                              <ChevronDown className="ml-auto h-4 w-4" />
                            ) : (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </SidebarMenuButton>
                          {isExpanded && (
                            <SidebarMenuSub>
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={location.pathname === subItem.path || location.pathname.startsWith(subItem.path)}
                                  >
                                    <NavLink to={subItem.path}>
                                      {subItem.title}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <NavLink to={item.path}>
                            <item.icon />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
