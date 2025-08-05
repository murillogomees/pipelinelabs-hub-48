
import React, { Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoaderProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface LazyComponentProps {
  component: ComponentType<any>;
  props?: any;
  fallback?: React.ReactNode;
}

export function LazyLoader({ fallback, children }: LazyLoaderProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2">Carregando...</span>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

export function LazyComponent({ component: Component, props, fallback }: LazyComponentProps) {
  return (
    <LazyLoader fallback={fallback}>
      <Component {...props} />
    </LazyLoader>
  );
}
