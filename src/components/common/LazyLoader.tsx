
import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children, 
  fallback 
}) => {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};
