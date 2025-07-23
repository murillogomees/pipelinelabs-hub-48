
import React, { useState } from 'react';
import { User, Menu, LogOut, Settings, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/Auth/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';

import { GlobalSearchTrigger } from '@/components/Search/GlobalSearchTrigger';
import { UserProfileDialog } from '@/components/User/UserProfileDialog';

import { PlanSubscriptionDialog } from '@/components/User/PlanSubscriptionDialog';
import { cleanupAuthState } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { isSuperAdmin, email } = usePermissions();
  const [profileOpen, setProfileOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const handleSecureSignOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for complete cleanup
      window.location.href = '/auth';
    } catch (error) {
      // Even if signOut fails, redirect to auth page
      window.location.href = '/auth';
    }
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <GlobalSearchTrigger />
        </div>

        <div className="flex items-center space-x-4">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm text-left">
                  <p className="font-medium text-foreground">{user?.email}</p>
                  <p className="text-muted-foreground">
                    {isSuperAdmin ? "Super Admin" : "Pipeline Labs"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <User className="w-4 h-4 mr-2" />
                Meu Perfil
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setPlanOpen(true)}>
                <Crown className="w-4 h-4 mr-2" />
                Plano e Assinatura
              </DropdownMenuItem>
              
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSecureSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialogs */}
      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      
      <PlanSubscriptionDialog open={planOpen} onOpenChange={setPlanOpen} />
    </header>
  );
}
