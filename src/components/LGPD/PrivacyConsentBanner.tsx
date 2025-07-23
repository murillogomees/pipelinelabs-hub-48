import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePrivacyConsentSimple } from '@/hooks/usePrivacyConsentSimple';
import { usePrivacyTermsSimple } from '@/hooks/usePrivacyTermsSimple';
import { Shield, FileText, Cookie, Mail } from 'lucide-react';

interface PrivacyConsentBannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyConsentBanner({ open, onOpenChange }: PrivacyConsentBannerProps) {
  const { createConsent, isCreating } = usePrivacyConsentSimple();
  const { terms } = usePrivacyTermsSimple();
  
  const [consents, setConsents] = useState({
    personal_data: false,
    analytics: false,
    marketing: false,
    cookies: false,
  });

  const consentOptions = [
    {
      key: 'personal_data',
      icon: Shield,
      title: 'Coleta de Dados Pessoais',
      description: 'Autorizo a coleta e tratamento dos meus dados pessoais (nome, CPF, e-mail) para prestação dos serviços.',
      required: true,
    },
    {
      key: 'analytics',
      icon: FileText,
      title: 'Rastreamento de Uso',
      description: 'Autorizo o uso de analytics e coleta de dados de navegação para melhorar a experiência do usuário.',
      required: false,
    },
    {
      key: 'cookies',
      icon: Cookie,
      title: 'Cookies',
      description: 'Autorizo o uso de cookies para funcionalidades essenciais e melhorias na navegação.',
      required: false,
    },
    {
      key: 'marketing',
      icon: Mail,
      title: 'Comunicações Comerciais',
      description: 'Autorizo o envio de e-mails promocionais e comunicações comerciais sobre novos recursos.',
      required: false,
    },
  ];

  const handleConsentChange = (key: string, checked: boolean) => {
    setConsents(prev => ({ ...prev, [key]: checked }));
  };

  const handleAccept = () => {
    if (!consents.personal_data) {
      return;
    }

    createConsent({
      accepted: true,
      consent_type: 'general',
      version: terms?.version || '1.0',
      metadata: consents,
    });

    onOpenChange(false);
  };

  const handleReject = () => {
    createConsent({
      accepted: false,
      consent_type: 'general',
      version: terms?.version || '1.0',
      metadata: consents,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacidade e Proteção de Dados
          </DialogTitle>
          <DialogDescription>
            Em conformidade com a LGPD, precisamos do seu consentimento para coletar e processar seus dados pessoais.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="space-y-4">
              {consentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.key} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="mt-1">
                      <Checkbox
                        id={option.key}
                        checked={consents[option.key as keyof typeof consents]}
                        onCheckedChange={(checked) => 
                          handleConsentChange(option.key, checked as boolean)
                        }
                        disabled={option.required && option.key === 'personal_data'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <label 
                          htmlFor={option.key}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {option.title}
                          {option.required && <span className="text-destructive ml-1">*</span>}
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-muted-foreground p-4 bg-muted rounded-lg">
              <p className="mb-2">
                <strong>Seus direitos:</strong> Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados a qualquer momento.
              </p>
              <p>
                Para mais informações, consulte nossa{' '}
                <a href="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={handleReject}
            disabled={isCreating}
          >
            Recusar
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!consents.personal_data || isCreating}
            className="min-w-[120px]"
          >
            {isCreating ? 'Salvando...' : 'Aceitar e Continuar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}