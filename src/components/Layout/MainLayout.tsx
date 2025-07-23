
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { EnvironmentBanner } from "@/components/Admin/VersionManagement/EnvironmentBanner";
import { NotificationDropdown } from '@/components/Notifications/NotificationDropdown';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen w-full bg-background grid grid-cols-[auto_1fr] overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="flex-shrink-0">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={toggleSidebar}
            onNavigate={closeMobileMenu}
          />
        </div>
      )}
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar 
              collapsed={false} 
              onToggle={() => {}}
              onNavigate={closeMobileMenu}
            />
          </SheetContent>
        </Sheet>
      )}
      
      <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden min-w-0">
        <header className="border-b bg-background">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <Header onToggleSidebar={toggleSidebar} />
            <NotificationDropdown />
          </div>
          <EnvironmentBanner />
        </header>
        
        <main className="overflow-y-auto bg-background min-h-0">
          <div className="container mx-auto max-w-7xl">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
