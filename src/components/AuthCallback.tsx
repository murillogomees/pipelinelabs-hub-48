
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback - Processing auth callback...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallback - Auth callback error:', error);
          navigate('/auth');
          return;
        }

        if (data.session) {
          console.log('AuthCallback - Session found, redirecting to dashboard');
          navigate('/app/dashboard');
        } else {
          console.log('AuthCallback - No session, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('AuthCallback - Auth callback error:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  );
}
