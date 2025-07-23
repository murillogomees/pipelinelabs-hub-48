import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTermsOfServiceSimple } from '@/hooks/useTermsOfServiceSimple';
import { TermsAcceptanceModal } from './TermsAcceptanceModal';

interface TermsContextType {
  showTermsModal: boolean;
  dismissTermsModal: () => void;
  requiresAcceptance: boolean;
}

const TermsContext = createContext<TermsContextType | undefined>(undefined);

export function useTermsContext() {
  const context = useContext(TermsContext);
  if (!context) {
    throw new Error('useTermsContext must be used within TermsProvider');
  }
  return context;
}

interface TermsProviderProps {
  children: React.ReactNode;
}

export function TermsProvider({ children }: TermsProviderProps) {
  const { user } = useAuth();
  const { hasAcceptedCurrent, currentTerms } = useTermsOfServiceSimple();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [requiresAcceptance, setRequiresAcceptance] = useState(false);

  useEffect(() => {
    // Only check for authenticated users
    if (user && currentTerms) {
      const needsAcceptance = !hasAcceptedCurrent;
      setRequiresAcceptance(needsAcceptance);
      
      if (needsAcceptance) {
        // Check if user has been shown the terms modal before
        const hasShownTermsModal = localStorage.getItem(`terms_modal_shown_${user.id}_${currentTerms.version}`);
        
        if (!hasShownTermsModal) {
          // Small delay to ensure page is loaded
          setTimeout(() => {
            setShowTermsModal(true);
          }, 1500);
        }
      }
    }
  }, [user, currentTerms, hasAcceptedCurrent]);

  const dismissTermsModal = () => {
    setShowTermsModal(false);
    if (user && currentTerms) {
      localStorage.setItem(`terms_modal_shown_${user.id}_${currentTerms.version}`, 'true');
    }
  };

  const handleTermsAccepted = () => {
    setRequiresAcceptance(false);
    setShowTermsModal(false);
    
    // Clear the modal shown flag since user has now accepted
    if (user && currentTerms) {
      localStorage.removeItem(`terms_modal_shown_${user.id}_${currentTerms.version}`);
    }
  };

  return (
    <TermsContext.Provider value={{ 
      showTermsModal, 
      dismissTermsModal, 
      requiresAcceptance 
    }}>
      {children}
      <TermsAcceptanceModal
        open={showTermsModal}
        onOpenChange={(open) => {
          if (!open) {
            dismissTermsModal();
          }
        }}
        onAccept={handleTermsAccepted}
      />
    </TermsContext.Provider>
  );
}