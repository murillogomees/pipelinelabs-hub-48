
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

  // Buscar soluções similares baseadas no prompt
  const findSimilarSolutions = useCallback(async (prompt: string): Promise<SimilarSolution[]> => {
    try {
      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .ilike('prompt', `%${prompt.slice(0, 50)}%`)
        .order('effectiveness_score', { ascending: false })
        .limit(5);

      if (error) throw error;

      return sessions?.map(session => ({
        id: session.id,
        prompt: session.prompt,
        solution: session.solution_summary,
        tags: session.tags || [],
        similarity: calculateSimilarity(prompt, session.prompt),
        usage_count: session.usage_count || 0,
        last_used: session.last_used || session.created_at,
        effectiveness_score: session.effectiveness_score || 0
      })) || [];
    } catch (error) {
      console.error('Error finding similar solutions:', error);
      return [];
    }
  }, []);

  // Buscar na base de conhecimento
  const searchKnowledgeBase = useCallback(async (keywords: string[]): Promise<KnowledgeEntry[]> => {
    try {
      const { data: entries, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .or(keywords.map(keyword => `tags.cs.{${keyword}}`).join(','))
        .order('success_rate', { ascending: false })
        .limit(10);

      if (error) throw error;

      return entries || [];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }, []);

  // Detectar padrões no prompt
  const detectPatterns = useCallback(async (prompt: string): Promise<Pattern[]> => {
    try {
      const { data: patterns, error } = await supabase
        .from('ai_patterns')
        .select('*')
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      return patterns?.filter(pattern => 
        pattern.trigger_keywords.some(keyword => 
          prompt.toLowerCase().includes(keyword.toLowerCase())
        )
      ) || [];
    } catch (error) {
      console.error('Error detecting patterns:', error);
      return [];
    }
  }, []);

  // Analisar contexto do prompt
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

  // Salvar sessão de aprendizado
  const saveLearningSession = useMutation({
    mutationFn: async (session: Omit<LearningSession, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          prompt: session.prompt,
          context: session.context,
          analysis: session.analysis,
          implementation: session.implementation,
          build_result: session.build_result,
          user_feedback: session.user_feedback,
          improvements_made: session.improvements_made,
          effectiveness_score: calculateEffectivenessScore(session),
          tags: extractTags(session.prompt),
          solution_summary: generateSolutionSummary(session.implementation)
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Atualizar base de conhecimento
  const updateKnowledgeBase = useMutation({
    mutationFn: async (entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: entry.title,
          description: entry.description,
          category: entry.category,
          tags: entry.tags,
          code_snippet: entry.code_snippet,
          files_affected: entry.files_affected,
          solution_type: entry.solution_type,
          usage_count: entry.usage_count,
          success_rate: entry.success_rate
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Dar feedback sobre uma solução
  const provideFeedback = useMutation({
    mutationFn: async ({ sessionId, feedback }: { sessionId: string; feedback: 'positive' | 'negative' }) => {
      const { error } = await supabase
        .from('learning_sessions')
        .update({ 
          user_feedback: feedback,
          effectiveness_score: feedback === 'positive' ? 
            supabase.sql`effectiveness_score + 0.1` : 
            supabase.sql`effectiveness_score - 0.1`
        })
        .eq('id', sessionId);

      if (error) throw error;
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

// Funções auxiliares
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
