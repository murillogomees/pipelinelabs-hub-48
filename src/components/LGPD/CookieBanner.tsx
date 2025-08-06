
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Cookie, Shield, Info } from 'lucide-react';

interface CookieBannerProps {
  open: boolean;
  onAccept: () => void;
}

export function CookieBanner({ open, onAccept }: CookieBannerProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md sm:max-w-lg w-[95vw] sm:w-full p-0 overflow-hidden" hideCloseButton>
        <DialogHeader className="p-4 sm:p-6 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Cookie className="h-5 w-5 text-primary" />
            Cookies Essenciais
          </DialogTitle>
          <DialogDescription className="text-sm">
            Este site utiliza cookies essenciais para seu funcionamento adequado.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/30">
              <Shield className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">Cookies de Funcionamento</h4>
                <p className="text-xs text-muted-foreground">
                  Necessários para autenticação, segurança e funcionamento básico do sistema.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">Política de Privacidade</h4>
                <p className="text-xs text-muted-foreground">
                  Ao continuar, você aceita o uso destes cookies essenciais. Para mais informações, consulte nossa{' '}
                  <a href="/privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center p-4 sm:p-6 pt-0 border-t">
          <Button onClick={onAccept} className="w-full sm:w-auto min-w-[200px]">
            Aceitar e Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
