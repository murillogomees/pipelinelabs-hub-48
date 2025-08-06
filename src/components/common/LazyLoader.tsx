
import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyLoaderProps {
  children: React.ReactNode;
}

export function LazyLoader({ children }: LazyLoaderProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      {children}
    </Suspense>
  );
}
