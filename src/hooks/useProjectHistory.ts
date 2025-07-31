
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

export interface ProjectHistoryEntry {
  id: string;
  user_id: string;
  action_type: string;
  prompt: string;
  generated_code: string;
  files_modified: string[];
  execution_time: number;
  success: boolean;
  error_message?: string;
  context_data: any;
  created_at: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end: string;
  total_prompts: number;
  success_rate: number;
  patterns_learned: string[];
  improvements: string[];
  created_at: string;
}

export function useProjectHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ProjectHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch real data from prompt_logs table
      const { data, error } = await supabase
        .from('prompt_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching prompt logs:', error);
        // Fallback to mock data if error
        const mockHistory: ProjectHistoryEntry[] = [{
          id: '1',
          user_id: user.id,
          action_type: 'component_generation',
          prompt: 'Exemplo de prompt inicial',
          generated_code: 'export const Example = () => <div>Example</div>;',
          files_modified: ['src/components/Example.tsx'],
          execution_time: 5000,
          success: true,
          context_data: { complexity: 'medium' },
          created_at: new Date().toISOString()
        }];
        setHistory(mockHistory);
        return;
      }

      // Transform prompt_logs data to ProjectHistoryEntry format
      const transformedHistory: ProjectHistoryEntry[] = (data || []).map(log => ({
        id: log.id,
        user_id: log.user_id,
        action_type: 'code_generation',
        prompt: log.prompt,
        generated_code: typeof log.generated_code === 'object' 
          ? JSON.stringify(log.generated_code) 
          : String(log.generated_code || ''),
        files_modified: Array.isArray(log.applied_files) 
          ? log.applied_files.map(file => String(file))
          : [],
        execution_time: 5000, // Default value since we don't have this in prompt_logs
        success: log.status === 'applied' || log.status === 'pending',
        error_message: log.error_message,
        context_data: { 
          model: log.model_used,
          temperature: log.temperature,
          status: log.status
        },
        created_at: log.created_at
      }));

      setHistory(transformedHistory);
    } catch (err) {
      console.error('Error fetching project history:', err);
      setError('Erro ao carregar histórico do projeto');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addHistoryEntry = async (entry: Omit<ProjectHistoryEntry, 'id' | 'created_at'>) => {
    if (!user?.id) return;

    try {
      const newEntry: ProjectHistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };

      setHistory(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error('Error adding history entry:', err);
    }
  };

  const getPatternAnalysis = () => {
    if (!Array.isArray(history)) return null;
    
    const patterns = {
      mostCommonActions: {} as Record<string, number>,
      successRate: 0,
      averageExecutionTime: 0,
      commonErrors: {} as Record<string, number>,
      filesModifiedFrequency: {} as Record<string, number>
    };

    if (history.length === 0) return patterns;

    // Calculate success rate
    const successCount = history.filter(entry => entry.success).length;
    patterns.successRate = (successCount / history.length) * 100;

    // Calculate average execution time
    const totalTime = history.reduce((sum, entry) => sum + entry.execution_time, 0);
    patterns.averageExecutionTime = totalTime / history.length;

    // Count action types
    history.forEach(entry => {
      patterns.mostCommonActions[entry.action_type] = (patterns.mostCommonActions[entry.action_type] || 0) + 1;
    });

    // Count errors
    history.forEach(entry => {
      if (entry.error_message) {
        patterns.commonErrors[entry.error_message] = (patterns.commonErrors[entry.error_message] || 0) + 1;
      }
    });

    // Count files modified
    history.forEach(entry => {
      if (Array.isArray(entry.files_modified)) {
        entry.files_modified.forEach(file => {
          patterns.filesModifiedFrequency[file] = (patterns.filesModifiedFrequency[file] || 0) + 1;
        });
      }
    });

    return patterns;
  };

  const getLearningInsights = () => {
    if (!Array.isArray(history) || history.length === 0) {
      return {
        totalSessions: 0,
        averageSuccessRate: 0,
        commonPatterns: [],
        recommendations: []
      };
    }

    const patterns = getPatternAnalysis();
    const insights = {
      totalSessions: history.length,
      averageSuccessRate: patterns?.successRate || 0,
      commonPatterns: Object.entries(patterns?.mostCommonActions || {})
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([action, count]) => ({ action, count })),
      recommendations: [] as string[]
    };

    // Generate recommendations based on patterns
    if (patterns?.successRate && patterns.successRate < 70) {
      insights.recommendations.push('Considere revisar os prompts para melhorar a taxa de sucesso');
    }

    if (patterns?.averageExecutionTime > 10000) {
      insights.recommendations.push('Otimize a complexidade dos prompts para reduzir o tempo de execução');
    }

    return insights;
  };

  const startLearningSession = async () => {
    if (!user?.id) return;

    try {
      const mockSession: LearningSession = {
        id: crypto.randomUUID(),
        user_id: user.id,
        session_start: new Date().toISOString(),
        session_end: new Date().toISOString(),
        total_prompts: 0,
        success_rate: 0,
        patterns_learned: [],
        improvements: [],
        created_at: new Date().toISOString()
      };

      return mockSession;
    } catch (err) {
      console.error('Error starting learning session:', err);
      return null;
    }
  };

  const analyzeSimilarPrompts = (prompt: string) => {
    if (!Array.isArray(history)) return [];
    
    return history.filter(entry => {
      const similarity = calculateSimilarity(prompt, entry.prompt);
      return similarity > 0.7;
    });
  };

  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  };

  const getContinuousLearningData = () => {
    if (!Array.isArray(history)) return null;
    
    return {
      totalExecutions: history.length,
      successRate: getPatternAnalysis()?.successRate || 0,
      commonPatterns: getPatternAnalysis()?.mostCommonActions || {},
      recentTrends: history.slice(0, 20),
      insights: getLearningInsights()
    };
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.id]);

  return {
    history,
    isLoading,
    error,
    addHistoryEntry,
    getPatternAnalysis,
    getLearningInsights,
    startLearningSession,
    analyzeSimilarPrompts,
    getContinuousLearningData,
    refetch: fetchHistory
  };
}
