
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AppSidebar } from './AppSidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

export function MobileSidebar({ isOpen, onClose, onNavigate }: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-64">
        <div onClick={onNavigate}>
          <AppSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
