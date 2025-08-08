
import React from 'react';
import { Header } from '../layout/Header';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { EnvironmentBanner } from "@/components/Admin/VersionManagement/EnvironmentBanner";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
        <SidebarTrigger className="lg:hidden" />
        <Header />
      </header>

      <EnvironmentBanner />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
