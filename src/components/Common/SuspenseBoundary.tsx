import React, { Suspense } from 'react';

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  const containerClasses = {
    small: 'min-h-[80px]',
    medium: 'min-h-[120px]',
    large: 'min-h-[200px]'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary`}></div>
    </div>
  );
};

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({ 
  children, 
  fallback,
  name = 'Component',
  size = 'medium' 
}) => {
  const defaultFallback = fallback || <LoadingSpinner size={size} />;

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
};

// Componente específico para dialogs
export const DialogSuspenseBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SuspenseBoundary 
    size="medium" 
    name="Dialog"
    fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    }
  >
    {children}
  </SuspenseBoundary>
);

// Componente específico para páginas
export const PageSuspenseBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SuspenseBoundary 
    size="large" 
    name="Page"
    fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }
  >
    {children}
  </SuspenseBoundary>
);

// Componente específico para tabelas
export const TableSuspenseBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SuspenseBoundary 
    size="medium" 
    name="Table"
    fallback={
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    }
  >
    {children}
  </SuspenseBoundary>
);

// Componente específico para cards
export const CardSuspenseBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SuspenseBoundary 
    size="small" 
    name="Card"
    fallback={
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    }
  >
    {children}
  </SuspenseBoundary>
);
