
import { useState, useCallback } from 'react';
import { ConversationState, ConversationStep, TechnicalAnalysis, ImplementationReport } from '@/components/Admin/PromptGenerator/types';

export const useConversationFlow = () => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentStep: 'initial_query',
    steps: [],
    originalPrompt: ''
  });

  const initializeConversation = useCallback((prompt: string) => {
    const initialStep: ConversationStep = {
      id: Date.now().toString(),
      type: 'initial_query',
      status: 'pending',
      content: prompt,
      timestamp: new Date().toISOString()
    };

    setConversationState({
      currentStep: 'initial_query',
      steps: [initialStep],
      originalPrompt: prompt
    });
  }, []);

  const addStep = useCallback((step: Omit<ConversationStep, 'id' | 'timestamp'>) => {
    const newStep: ConversationStep = {
      ...step,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    setConversationState(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
      currentStep: step.type
    }));
  }, []);

  const updateCurrentStep = useCallback((status: ConversationStep['status'], content?: string) => {
    setConversationState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.type === prev.currentStep 
          ? { ...step, status, content: content || step.content }
          : step
      )
    }));
  }, []);

  const setTechnicalAnalysis = useCallback((analysis: TechnicalAnalysis) => {
    setConversationState(prev => ({
      ...prev,
      technicalAnalysis: analysis
    }));
  }, []);

  const setImplementationReport = useCallback((report: ImplementationReport) => {
    setConversationState(prev => ({
      ...prev,
      implementationReport: report
    }));
  }, []);

  const moveToNextStep = useCallback((nextStep: ConversationStep['type']) => {
    setConversationState(prev => ({
      ...prev,
      currentStep: nextStep
    }));
  }, []);

  const resetConversation = useCallback(() => {
    setConversationState({
      currentStep: 'initial_query',
      steps: [],
      originalPrompt: ''
    });
  }, []);

  return {
    conversationState,
    initializeConversation,
    addStep,
    updateCurrentStep,
    setTechnicalAnalysis,
    setImplementationReport,
    moveToNextStep,
    resetConversation
  };
};
