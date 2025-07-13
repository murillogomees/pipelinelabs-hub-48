
import React, { useState } from 'react';
import { User, Menu, LogOut, Settings, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/Auth/AuthProvider';
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import { GlobalSearchTrigger } from '@/components/Search/GlobalSearchTrigger';
import { UserProfileDialog } from '@/components/User/UserProfileDialog';
import { TeamManagementDialog } from '@/components/User/TeamManagementDialog';
import { PlanSubscriptionDialog } from '@/components/User/PlanSubscriptionDialog';
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const handleSecureSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
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
          <NotificationBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-left">
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-gray-500">Pipeline Labs</p>
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
              
              <DropdownMenuItem onClick={() => setTeamOpen(true)}>
                <Users className="w-4 h-4 mr-2" />
                Minha Equipe
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
      <TeamManagementDialog open={teamOpen} onOpenChange={setTeamOpen} />
      <PlanSubscriptionDialog open={planOpen} onOpenChange={setPlanOpen} />
    </header>
  );
}
