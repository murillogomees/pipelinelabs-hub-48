
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
    <div className="min-h-screen w-full bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
          onNavigate={closeMobileMenu}
        />
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
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-mobile container-mobile">
            <div className="mb-4">
              <EnvironmentBanner />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
