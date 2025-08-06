
import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { menuItems } from './Sidebar/constants';
import { usePermissions } from '@/hooks/usePermissions';
import { PipelineLabsLogo } from './PipelineLabsLogo';
import { Button } from '@/components/ui/button';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

export function MobileSidebar({ isOpen, onClose, onNavigate }: MobileSidebarProps) {
  const isMobile = useIsMobile();
  const { isAdmin, isSuperAdmin } = usePermissions();

  const handleNavClick = () => {
    onNavigate();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card",
          "transition-transform duration-300 ease-in-out"
        )}
      >
        <div className="flex items-center gap-2 p-4 border-b">
          <PipelineLabsLogo size="md" showText={true} />
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems
              .filter(item => !item.adminOnly || isAdmin || isSuperAdmin)
              .map((item) => (
                <div key={item.title}>
                  {item.submenu && item.submenu.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )
                            }
                          >
                            <span>{subItem.title}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  )}
                </div>
              ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <PipelineLabsLogo size="md" showText={true} />
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {menuItems
              .filter(item => !item.adminOnly || isAdmin || isSuperAdmin)
              .map((item) => (
                <div key={item.title}>
                  {item.submenu && item.submenu.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {item.submenu.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px]",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )
                            }
                          >
                            <span>{subItem.title}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px]",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  )}
                </div>
              ))}
          </div>
        </nav>
      </div>
    </>
  );
}
