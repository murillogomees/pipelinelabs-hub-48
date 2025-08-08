
import React, { useState } from 'react';
import { Header } from '../layout/Header';
import { MobileSidebar } from './MobileSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { EnvironmentBanner } from "@/components/Admin/VersionManagement/EnvironmentBanner";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleNavigate = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header - Always visible */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          sidebarOpen={sidebarOpen}
        />
      </header>

      <EnvironmentBanner />

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={handleNavigate}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 lg:p-6">
            {children}
          </div>
        </main>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
