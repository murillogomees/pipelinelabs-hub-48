
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
