
import { Bell, Search, User, LogOut, Settings, Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { useProfile } from '@/hooks/useProfile';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export const Header = ({ onMenuClick, sidebarOpen }: HeaderProps) => {
  const { profile } = useProfile();
  const { openPalette } = useCommandPalette();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Get display name with fallback
  const displayName = profile?.display_name || profile?.email || 'Usuário';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <div className="flex flex-1 items-center gap-4">
          {/* Mobile menu button */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <div className="w-full max-w-sm">
            <Button
              variant="outline"
              className="relative w-full justify-start text-sm font-normal"
              onClick={openPalette}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline-flex">Buscar ou gerar código...</span>
              <span className="lg:hidden">Buscar...</span>
              <div className="ml-auto flex items-center gap-1">
                <Kbd>
                  <span className="text-xs">⌘</span>K
                </Kbd>
              </div>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notificações</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} alt={displayName} />
                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{displayName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              {/* Command Palette Shortcut */}
              <DropdownMenuItem onClick={openPalette}>
                <Zap className="mr-2 h-4 w-4" />
                <span>Command Palette</span>
                <div className="ml-auto">
                  <Kbd>⌘K</Kbd>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
