import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Download, Shield, AlertTriangle, Lock } from 'lucide-react';
import { useBackupSettings } from '@/hooks/useBackupSettings';
import { useProfile } from '@/hooks/useProfile';
import { useForm } from 'react-hook-form';

interface BackupForm {
  auto_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  backup_time: string;
  retention_days: number;
  backup_tables: string[];
}

const availableTables = [
  'companies',
  'customers',
  'products',
  'sales',
  'invoices',
  'accounts_payable',
  'accounts_receivable',
  'stock_movements',
  'proposals',
  'contracts',
];

export function BackupSettings() {
  const { isSuperAdmin } = useProfile();
  const { 
    settings, 
    isLoading, 
    error,
    updateSettings, 
    triggerBackup, 
    isUpdating, 
    isTriggeringBackup, 
    canManageBackup 
  } = useBackupSettings();
  
  const { register, handleSubmit, setValue, watch, formState: { isDirty } } = useForm<BackupForm>({
    defaultValues: {
      auto_backup_enabled: settings?.auto_backup_enabled || false,
      backup_frequency: settings?.backup_frequency || 'daily',
      backup_time: settings?.backup_time || '02:00',
      retention_days: settings?.retention_days || 30,
      backup_tables: settings?.backup_tables || availableTables,
    },
  });

  React.useEffect(() => {
    if (settings) {
      setValue('auto_backup_enabled', settings.auto_backup_enabled);
      setValue('backup_frequency', settings.backup_frequency);
      setValue('backup_time', settings.backup_time);
      setValue('retention_days', settings.retention_days);
      setValue('backup_tables', settings.backup_tables);
    }
  }, [settings, setValue]);

  const onSubmit = (data: BackupForm) => {
    updateSettings(data);
  };

  const handleTableToggle = (table: string) => {
    const currentTables = watch('backup_tables');
    const newTables = currentTables.includes(table)
      ? currentTables.filter(t => t !== table)
      : [...currentTables, table];
    setValue('backup_tables', newTables);
  };

  // Verificar se não é super admin
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Configurações de Backup</h2>
            <p className="text-muted-foreground">
              Configure backups automáticos para proteger seus dados
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Lock className="h-16 w-16 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Acesso Restrito</h3>
                <p className="text-muted-foreground max-w-md">
                  Apenas super administradores podem acessar e configurar as opções de backup do sistema.
                </p>
                <p className="text-sm text-muted-foreground">
                  Entre em contato com um administrador do sistema para obter acesso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar configurações de backup: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Backup</h2>
          <p className="text-muted-foreground">
            Configure backups automáticos para proteger seus dados
          </p>
        </div>
        <Button
          onClick={() => triggerBackup()}
          disabled={isTriggeringBackup}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isTriggeringBackup ? 'Iniciando...' : 'Backup Manual'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar backups automáticos do sistema
                </p>
              </div>
              <Switch
                checked={watch('auto_backup_enabled')}
                onCheckedChange={(checked) => setValue('auto_backup_enabled', checked)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={watch('backup_frequency')}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setValue('backup_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  {...register('backup_time')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Retenção (dias)</Label>
              <Input
                type="number"
                min="1"
                max="365"
                {...register('retention_days', { valueAsNumber: true })}
              />
              <p className="text-sm text-muted-foreground">
                Backups mais antigos que este período serão automaticamente removidos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabelas para Backup</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecione as tabelas que devem ser incluídas no backup
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableTables.map((table) => (
                <div key={table} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={table}
                    checked={watch('backup_tables').includes(table)}
                    onChange={() => handleTableToggle(table)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={table} className="text-sm font-medium cursor-pointer">
                    {table}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {settings?.last_backup_at && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Status do Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Último backup:</span>
                <Badge variant="outline">
                  {new Date(settings.last_backup_at).toLocaleString('pt-BR')}
                </Badge>
              </div>
              
              {settings.next_backup_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Próximo backup:</span>
                  <Badge variant="secondary">
                    {new Date(settings.next_backup_at).toLocaleString('pt-BR')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Configurações de backup do sistema</span>
          </div>
          
          <Button
            type="submit"
            disabled={!isDirty || isUpdating}
            className="gap-2"
          >
            {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
