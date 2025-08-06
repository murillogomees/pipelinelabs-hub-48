
import React from 'react';
import { CookieBanner } from './CookieBanner';
import { useMandatoryCookie } from '@/hooks/useMandatoryCookie';

interface MandatoryCookieProviderProps {
  children: React.ReactNode;
}

export function MandatoryCookieProvider({ children }: MandatoryCookieProviderProps) {
  const { showBanner, acceptCookie } = useMandatoryCookie();

  return (
    <>
      {children}
      <CookieBanner 
        open={showBanner}
        onAccept={acceptCookie}
      />
    </>
  );
}
