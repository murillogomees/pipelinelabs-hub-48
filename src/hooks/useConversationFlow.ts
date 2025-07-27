
import { useState } from 'react';
import { ConversationState, ConversationStep } from '@/components/Admin/PromptGenerator/types';

export const useConversationFlow = () => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentStep: 'initial_query',
    steps: [],
    originalPrompt: ''
  });

  const initializeConversation = (prompt: string) => {
    setConversationState({
      currentStep: 'initial_query',
      steps: [],
      originalPrompt: prompt
    });
  };

  const addStep = (step: Omit<ConversationStep, 'id' | 'timestamp'>) => {
    const newStep: ConversationStep = {
      ...step,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    setConversationState(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateConversationState = (updates: Partial<ConversationState>) => {
    setConversationState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const setCurrentStep = (step: ConversationStep['type']) => {
    setConversationState(prev => ({
      ...prev,
      currentStep: step
    }));
  };

  const setTechnicalAnalysis = (analysis: ConversationState['technicalAnalysis']) => {
    setConversationState(prev => ({
      ...prev,
      technicalAnalysis: analysis
    }));
  };

  const setImplementationReport = (report: ConversationState['implementationReport']) => {
    setConversationState(prev => ({
      ...prev,
      implementationReport: report
    }));
  };

  const resetConversation = () => {
    setConversationState({
      currentStep: 'initial_query',
      steps: [],
      originalPrompt: ''
    });
  };

  return {
    conversationState,
    initializeConversation,
    addStep,
    updateConversationState,
    setCurrentStep,
    setTechnicalAnalysis,
    setImplementationReport,
    resetConversation
  };
};
