import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'unknown';
  lastSync?: string;
  onSync?: () => void;
  onReconnect?: () => void;
  isLoading?: boolean;
}

export const ConnectionStatus = ({ 
  status, 
  lastSync, 
  onSync, 
  onReconnect, 
  isLoading 
}: ConnectionStatusProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Conectado',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          text: 'Erro',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'syncing':
        return {
          variant: 'secondary' as const,
          icon: Loader2,
          text: 'Sincronizando',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'disconnected':
        return {
          variant: 'outline' as const,
          icon: XCircle,
          text: 'Desconectado',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: AlertCircle,
          text: 'Desconhecido',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div className="flex items-center gap-3">
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        <Icon className={`w-3 h-3 mr-1 ${status === 'syncing' ? 'animate-spin' : ''}`} />
        {statusInfo.text}
      </Badge>
      
      {lastSync && (
        <span className="text-xs text-muted-foreground">
          Última sync: {new Date(lastSync).toLocaleString('pt-BR')}
        </span>
      )}
      
      <div className="flex gap-2">
        {status === 'connected' && onSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isLoading}
            className="h-7 px-2"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>
        )}
        
        {(status === 'disconnected' || status === 'error') && onReconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            disabled={isLoading}
            className="h-7 px-3 text-xs"
          >
            Reconectar
          </Button>
        )}
      </div>
    </div>
  );
};