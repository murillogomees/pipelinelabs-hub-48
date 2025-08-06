import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PrivacyConsentBanner } from './PrivacyConsentBanner';

interface PrivacyConsentContextType {
  showBanner: boolean;
  dismissBanner: () => void;
}

const PrivacyConsentContext = createContext<PrivacyConsentContextType | undefined>(undefined);

export function usePrivacyConsentContext() {
  const context = useContext(PrivacyConsentContext);
  if (!context) {
    throw new Error('usePrivacyConsentContext must be used within PrivacyConsentProvider');
  }
  return context;
}

interface PrivacyConsentProviderProps {
  children: React.ReactNode;
}

export function PrivacyConsentProvider({ children }: PrivacyConsentProviderProps) {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show banner for authenticated users who haven't given consent
    if (user) {
      // Check localStorage first to avoid showing banner on every reload
      const hasShownBanner = localStorage.getItem(`privacy_banner_shown_${user.id}`);
      const hasConsent = localStorage.getItem(`privacy_consent_${user.id}`);
      
      if (!hasShownBanner && !hasConsent) {
        // Small delay to ensure page is loaded
        setTimeout(() => {
          setShowBanner(true);
        }, 1000);
      }
    }
  }, [user]);

  const dismissBanner = () => {
    setShowBanner(false);
    if (user) {
      localStorage.setItem(`privacy_banner_shown_${user.id}`, 'true');
    }
  };

  const handleConsentGiven = () => {
    if (user) {
      localStorage.setItem(`privacy_consent_${user.id}`, 'true');
    }
    dismissBanner();
  };

  return (
    <PrivacyConsentContext.Provider value={{ showBanner, dismissBanner }}>
      {children}
      <PrivacyConsentBanner 
        open={showBanner} 
        onOpenChange={(open) => {
          if (!open) {
            dismissBanner();
          }
        }}
      />
    </PrivacyConsentContext.Provider>
  );
}