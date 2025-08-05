
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';

interface NotificationSettingsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function NotificationSettings({ formData, setFormData }: NotificationSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        <Label>Notificações</Label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="notificacoes-ativas">Notificações Ativas</Label>
          <p className="text-sm text-muted-foreground">
            Receber notificações sobre auditorias
          </p>
        </div>
        <Switch
          id="notificacoes-ativas"
          checked={formData.notificacoes_ativas}
          onCheckedChange={(value) => 
            setFormData((prev: any) => ({ ...prev, notificacoes_ativas: value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-notificacao">Email para Notificações</Label>
        <Input
          id="email-notificacao"
          type="email"
          placeholder="email@exemplo.com"
          value={formData.email_notificacao}
          onChange={(e) => 
            setFormData((prev: any) => ({ ...prev, email_notificacao: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-notificacao">Webhook para Notificações</Label>
        <Input
          id="webhook-notificacao"
          type="url"
          placeholder="https://exemplo.com/webhook"
          value={formData.webhook_notificacao}
          onChange={(e) => 
            setFormData((prev: any) => ({ ...prev, webhook_notificacao: e.target.value }))
          }
        />
      </div>
    </div>
  );
}
