
import React from 'react';
import { EnhancedConversationalDashboard } from './EnhancedConversationalDashboard';

interface ConversationalDashboardProps {
  onBackToTraditional: () => void;
}

export const ConversationalDashboard: React.FC<ConversationalDashboardProps> = (props) => {
  return <EnhancedConversationalDashboard {...props} />;
};
