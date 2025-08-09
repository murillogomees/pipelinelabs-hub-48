import React from 'react';

interface SetupWaitingProps {
  children: React.ReactNode;
}

export function SetupWaiting({ children }: SetupWaitingProps) {
  return <>{children}</>;
}
