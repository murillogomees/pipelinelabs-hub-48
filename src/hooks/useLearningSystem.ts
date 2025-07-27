
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LearningContext, 
  SimilarSolution, 
  KnowledgeEntry, 
  Pattern,
  LearningSession,
  BuildResult
} from '@/components/Admin/PromptGenerator/types';

export const useLearningSystem = () => {
  const [learningContext, setLearningContext] = useState<LearningContext>({
    similarSolutions: [],
    knowledgeBase: [],
    patterns: [],
    suggestions: []
  });

  // Mock functions for now since tables don't exist
  const findSimilarSolutions = useCallback(async (prompt: string): Promise<SimilarSolution[]> => {
    try {
      // Mock similar solutions
      return [
        {
          id: '1',
          prompt: 'Criar componente de formulário',
          solution: 'Componente React com TypeScript',
          tags: ['react', 'typescript', 'form'],
          similarity: 0.85,
          usage_count: 5,
          last_used: new Date().toISOString(),
          effectiveness_score: 0.9
        }
      ];
    } catch (error) {
      console.error('Error finding similar solutions:', error);
      return [];
    }
  }, []);

  const searchKnowledgeBase = useCallback(async (keywords: string[]): Promise<KnowledgeEntry[]> => {
    try {
      // Mock knowledge base entries
      return [
        {
          id: '1',
          title: 'Padrão de Componentes React',
          description: 'Como criar componentes reutilizáveis',
          category: 'frontend',
          tags: ['react', 'components'],
          code_snippet: 'const Component = () => <div>...</div>',
          files_affected: ['src/components/Component.tsx'],
          solution_type: 'component',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 10,
          success_rate: 0.95
        }
      ];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }, []);

  const detectPatterns = useCallback(async (prompt: string): Promise<Pattern[]> => {
    try {
      // Mock patterns
      return [
        {
          id: '1',
          pattern_type: 'architectural',
          description: 'Padrão de componente com hook customizado',
          trigger_keywords: ['componente', 'hook', 'estado'],
          recommended_solution: 'Criar hook customizado para lógica',
          confidence_score: 0.8,
          examples: ['useCustomHook', 'useState', 'useEffect']
        }
      ];
    } catch (error) {
      console.error('Error detecting patterns:', error);
      return [];
    }
  }, []);

  const analyzeContext = useMutation({
    mutationFn: async (prompt: string): Promise<LearningContext> => {
      const keywords = extractKeywords(prompt);
      
      const [similarSolutions, knowledgeBase, patterns] = await Promise.all([
        findSimilarSolutions(prompt),
        searchKnowledgeBase(keywords),
        detectPatterns(prompt)
      ]);

      const suggestions = generateSuggestions(prompt, similarSolutions, knowledgeBase, patterns);

      return {
        similarSolutions,
        knowledgeBase,
        patterns,
        suggestions
      };
    }
  });

  const saveLearningSession = useMutation({
    mutationFn: async (session: Omit<LearningSession, 'id' | 'created_at'>) => {
      // Mock implementation
      console.log('Saving learning session:', session);
      return { id: '1', ...session, created_at: new Date().toISOString() };
    }
  });

  const updateKnowledgeBase = useMutation({
    mutationFn: async (entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation
      console.log('Updating knowledge base:', entry);
      return { 
        id: '1', 
        ...entry, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  });

  const provideFeedback = useMutation({
    mutationFn: async ({ sessionId, feedback }: { sessionId: string; feedback: 'positive' | 'negative' }) => {
      // Mock implementation
      console.log('Providing feedback:', sessionId, feedback);
      return true;
    }
  });

  return {
    learningContext,
    setLearningContext,
    analyzeContext: analyzeContext.mutate,
    isAnalyzing: analyzeContext.isPending,
    saveLearningSession: saveLearningSession.mutate,
    updateKnowledgeBase: updateKnowledgeBase.mutate,
    provideFeedback: provideFeedback.mutate,
    findSimilarSolutions,
    searchKnowledgeBase,
    detectPatterns
  };
};

// Helper functions
function calculateSimilarity(prompt1: string, prompt2: string): number {
  const words1 = prompt1.toLowerCase().split(/\s+/);
  const words2 = prompt2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  
  return intersection.length / union.length;
}

function extractKeywords(prompt: string): string[] {
  const commonWords = ['o', 'a', 'de', 'para', 'com', 'em', 'um', 'uma', 'do', 'da', 'que', 'e', 'é'];
  return prompt
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10);
}

function extractTags(prompt: string): string[] {
  const techTerms = ['react', 'typescript', 'supabase', 'api', 'database', 'component', 'hook', 'form', 'crud'];
  return techTerms.filter(term => prompt.toLowerCase().includes(term));
}

function generateSuggestions(
  prompt: string, 
  similarSolutions: SimilarSolution[], 
  knowledgeBase: KnowledgeEntry[],
  patterns: Pattern[]
): string[] {
  const suggestions: string[] = [];

  if (similarSolutions.length > 0) {
    suggestions.push(`Encontrei ${similarSolutions.length} soluções similares que podem ser reaproveitadas`);
  }

  if (knowledgeBase.length > 0) {
    suggestions.push(`Há ${knowledgeBase.length} entradas na base de conhecimento relacionadas`);
  }

  if (patterns.length > 0) {
    suggestions.push(`Detectei ${patterns.length} padrões arquiteturais aplicáveis`);
  }

  return suggestions;
}

function calculateEffectivenessScore(session: Omit<LearningSession, 'id' | 'created_at'>): number {
  let score = 0.5; // Base score

  // Build success increases score
  if (session.build_result.success) {
    score += 0.3;
  }

  // Fewer errors increase score
  if (session.build_result.errors.length === 0) {
    score += 0.2;
  }

  // User feedback affects score
  if (session.user_feedback === 'positive') {
    score += 0.2;
  } else if (session.user_feedback === 'negative') {
    score -= 0.2;
  }

  return Math.max(0, Math.min(1, score));
}

function generateSolutionSummary(implementation: any): string {
  const { modifiedFiles, functionsCreated, databaseChanges } = implementation;
  
  return `Modificados ${modifiedFiles.length} arquivos, criadas ${functionsCreated.length} funções, alteradas ${databaseChanges.tables.length} tabelas`;
}
