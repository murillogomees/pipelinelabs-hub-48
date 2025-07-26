
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { EnvironmentBanner } from "@/components/Admin/VersionManagement/EnvironmentBanner";

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
    <div className="h-screen w-full bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onNavigate={closeMobileMenu}
        />
      )}
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar 
              collapsed={false} 
              onNavigate={closeMobileMenu}
            />
          </SheetContent>
        </Sheet>
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="flex-shrink-0 border-b bg-background">
          <Header onToggleSidebar={toggleSidebar} />
          <EnvironmentBanner />
        </header>
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="h-full w-full">
            <div className="p-4 sm:p-6 lg:p-8 max-w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
