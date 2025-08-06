
import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'mandatory_cookie_accepted';

export function useMandatoryCookie() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verifica se o cookie já foi aceito
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
    
    if (!hasAccepted) {
      // Pequeno delay para garantir que a página carregou
      setTimeout(() => {
        setShowBanner(true);
      }, 500);
    }
  }, []);

  const acceptCookie = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(`${COOKIE_CONSENT_KEY}_date`, new Date().toISOString());
    setShowBanner(false);
    
    // Define um cookie técnico essencial
    document.cookie = `site_consent=accepted; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Strict`;
  };

  const hasConsent = () => {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
  };

  return {
    showBanner,
    acceptCookie,
    hasConsent,
  };
}
