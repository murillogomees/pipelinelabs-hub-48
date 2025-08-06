
import React from 'react';

export function EnvironmentBanner() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>Ambiente de Desenvolvimento</span>
        </div>
      </div>
    </div>
  );
}
