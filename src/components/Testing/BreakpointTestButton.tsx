import React from 'react';
import { EnhancedButton as Button } from '@/components/ui/enhanced-button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BreakpointTestButtonProps {
  className?: string;
}

export function BreakpointTestButton({ className }: BreakpointTestButtonProps) {
  const navigate = useNavigate();
  
  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/app/breakpoint-test')}
      className={className}
    >
      <Eye className="w-4 h-4 mr-2" />
      Testar Breakpoints
    </Button>
  );
}