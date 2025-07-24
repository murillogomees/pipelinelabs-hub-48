import { MoreHorizontal, Globe, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MarketplaceChannel } from '@/hooks/useMarketplaceChannels';

interface ChannelCardProps {
  channel: MarketplaceChannel;
  onEdit: (channel: MarketplaceChannel) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: boolean) => void;
  isLoading?: boolean;
}

export function ChannelCard({
  channel,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false
}: ChannelCardProps) {
  const handleToggleStatus = () => {
    onToggleStatus(channel.id, !channel.status);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={channel.logo_url} alt={channel.name} />
            <AvatarFallback>
              <Globe className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{channel.name}</CardTitle>
            <CardDescription className="text-sm">
              {channel.slug}
            </CardDescription>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={channel.status ? 'default' : 'secondary'}>
            {channel.status ? 'Ativo' : 'Inativo'}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(channel)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleToggleStatus}>
                {channel.status ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Ativar
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(channel.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      {channel.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {channel.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}