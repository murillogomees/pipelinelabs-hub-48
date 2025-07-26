import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Search, Settings, User, LogOut, Menu, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '@/components/Auth/AuthProvider';
import { NotificationDropdown } from '@/components/Notifications/NotificationDropdown';
import { GlobalSearchTrigger } from '@/components/Search/GlobalSearchTrigger';
import { MobileSidebar } from './MobileSidebar';
import { useMobileSidebar } from '@/hooks/useMobileSidebar';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useMobileSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 items-center px-4">
        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" onClick={onOpen} className="mr-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={isOpen} onClose={onClose} />

        {/* Global Search Trigger */}
        <GlobalSearchTrigger isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />

        <div className="ml-auto flex items-center space-x-4">
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/app/user/dados-pessoais" className="flex items-center gap-2">
                  <User className="h-4 w-4 mr-2" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/configuracoes" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
