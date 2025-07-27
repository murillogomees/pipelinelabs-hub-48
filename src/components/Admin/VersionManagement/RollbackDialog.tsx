
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useRollback, useCanRollback } from "@/hooks/useRollback";
import { AppVersion } from "@/hooks/useAppVersions";
import { RotateCcw, AlertTriangle, GitBranch } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RollbackDialogProps {
  version: AppVersion;
  children?: React.ReactNode;
}

export const RollbackDialog = ({ version, children }: RollbackDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [targetEnvironment, setTargetEnvironment] = useState<'production' | 'staging' | 'preview'>('staging');
  
  const { mutateAsync: rollbackMutation, isRollingBack } = useRollback();
  const { canRollbackProduction, canRollbackStaging } = useCanRollback();

  const canRollback = () => {
    switch (targetEnvironment) {
      case 'production':
        return canRollbackProduction;
      case 'staging':
        return canRollbackStaging;
      default:
        return true;
    }
  };

  const handleRollback = async () => {
    if (!reason.trim()) {
      return;
    }

    try {
      await rollbackMutation({
        versionId: version.id,
        reason: reason.trim(),
        targetEnvironment,
        rollbackType: 'manual',
        rollbackBy: 'admin_user'
      });

      setOpen(false);
      setReason('');
    } catch (error) {
      console.error('Erro no rollback:', error);
    }
  };

  const isCurrentVersion = version.status === 'active';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm"
            disabled={isCurrentVersion}
            className="text-orange-600 hover:text-orange-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Rollback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Confirmar Rollback
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta ação irá reverter o ambiente selecionado para esta versão. 
              A versão atual será marcada como "revertida".
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Versão de Destino</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-mono text-sm">v{version.version_number}</div>
                <div className="text-xs text-muted-foreground">
                  {version.git_branch} • {version.git_sha.substring(0, 8)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(version.deployed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Ambiente</Label>
            <Select 
              value={targetEnvironment} 
              onValueChange={(value: 'production' | 'staging' | 'preview') => 
                setTargetEnvironment(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preview">Preview</SelectItem>
                <SelectItem 
                  value="staging" 
                  disabled={!canRollbackStaging}
                >
                  Homologação {!canRollbackStaging && '(Sem permissão)'}
                </SelectItem>
                <SelectItem 
                  value="production" 
                  disabled={!canRollbackProduction}
                >
                  <div className="flex items-center gap-2">
                    Produção 
                    <Badge variant="destructive" className="text-xs">Crítico</Badge>
                    {!canRollbackProduction && ' (Sem permissão)'}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do Rollback *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Bug crítico na funcionalidade X, problema de performance, erro de autenticação..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          {targetEnvironment === 'production' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-600">
                <strong>ATENÇÃO:</strong> Rollback em produção afetará todos os usuários. 
                Certifique-se de que esta ação é necessária.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRollback}
              disabled={!reason.trim() || !canRollback() || isRollingBack}
              variant="destructive"
            >
              {isRollingBack ? 'Executando...' : 'Confirmar Rollback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
