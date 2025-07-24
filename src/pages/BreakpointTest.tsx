import React from 'react';
import { BreakpointTester } from '@/components/Testing/BreakpointTester';
import { BreakpointIndicator } from '@/components/Testing/BreakpointIndicator';

export function BreakpointTest() {
  return (
    <div className="min-h-screen bg-background">
      <BreakpointTester />
      <BreakpointIndicator position="bottom-right" showDetails={true} />
    </div>
  );
}