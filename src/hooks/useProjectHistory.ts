
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthProvider';

interface ProjectHistoryEntry {
  id: string;
  user_id: string;
  company_id: string;
  session_id: string;
  prompt: string;
  response: any;
  files_modified: string[];
  errors_fixed: string[];
  build_status: 'success' | 'failed' | 'pending';
  technical_decisions: any[];
  impact_level: 'low' | 'medium' | 'high';
  similarity_hash: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface LovableHistoryData {
  messages: any[];
  builds: any[];
  errors: any[];
  migrations: any[];
  executions: any[];
  file_changes: any[];
}

export const useProjectHistory = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  // Buscar histórico completo do projeto usando query SQL direta
  const { data: projectHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['project-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Usar SQL direto para consultar a nova tabela
      const { data, error } = await supabase
        .rpc('get_project_history', { 
          p_user_id: user.id,
          p_limit: 1000 
        })
        .returns<ProjectHistoryEntry[]>();

      if (error) {
        console.error('Error fetching project history:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id
  });

  // Indexar dados do histórico Lovable
  const indexLovableHistory = useMutation({
    mutationFn: async (historyData: LovableHistoryData) => {
      const indexedEntries = await processLovableHistory(historyData);
      
      for (const entry of indexedEntries) {
        const { error } = await supabase
          .rpc('insert_project_history', entry);
          
        if (error) {
          console.error('Error inserting project history:', error);
        }
      }
      
      return indexedEntries;
    }
  });

  // Processar dados do histórico do Lovable
  const processLovableHistory = async (historyData: LovableHistoryData): Promise<Partial<ProjectHistoryEntry>[]> => {
    const entries: Partial<ProjectHistoryEntry>[] = [];
    
    // Processar mensagens
    for (const message of historyData.messages) {
      if (message.role === 'user' && message.content) {
        const entry: Partial<ProjectHistoryEntry> = {
          id: `msg_${message.id}`,
          user_id: user?.id || '',
          company_id: await getUserCompanyId(),
          session_id: message.session_id || generateSessionId(),
          prompt: message.content,
          response: message.response || {},
          files_modified: extractFilesFromMessage(message),
          errors_fixed: extractErrorsFromMessage(message),
          build_status: (message.build_status as 'success' | 'failed' | 'pending') || 'pending',
          technical_decisions: extractTechnicalDecisions(message),
          impact_level: calculateImpactLevel(message),
          similarity_hash: calculateSimilarityHash(message.content),
          tags: extractTags(message.content),
          created_at: message.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        entries.push(entry);
      }
    }
    
    return entries;
  };

  // Funções auxiliares
  const getUserCompanyId = async (): Promise<string> => {
    // Buscar empresa do usuário via profiles
    const { data } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user?.id)
      .single();
    return data?.company_id || '';
  };

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const extractFilesFromMessage = (message: any): string[] => {
    const files: string[] = [];
    const content = message.content || '';
    
    // Extrair arquivos mencionados no conteúdo
    const fileMatches = content.match(/src\/[^\s]+\.(tsx?|jsx?|ts|js|css|scss)/g);
    if (fileMatches) {
      files.push(...fileMatches);
    }
    
    // Extrair de metadados se disponível
    if (message.metadata?.files_modified) {
      files.push(...message.metadata.files_modified);
    }
    
    return [...new Set(files)];
  };

  const extractErrorsFromMessage = (message: any): string[] => {
    const errors: string[] = [];
    const content = message.content || '';
    
    // Extrair erros TypeScript
    const tsErrors = content.match(/error TS\d+: [^\n]+/g);
    if (tsErrors) {
      errors.push(...tsErrors);
    }
    
    // Extrair outros erros
    const generalErrors = content.match(/Error: [^\n]+/g);
    if (generalErrors) {
      errors.push(...generalErrors);
    }
    
    return errors;
  };

  const extractTechnicalDecisions = (message: any): any[] => {
    const decisions: any[] = [];
    const content = message.content || '';
    
    // Detectar decisões técnicas comuns
    const patterns = [
      /usar\s+(React|TypeScript|Tailwind|Supabase|Tanstack)/gi,
      /implementar\s+(.+)/gi,
      /refatorar\s+(.+)/gi,
      /otimizar\s+(.+)/gi,
      /corrigir\s+(.+)/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        decisions.push(...matches.map(match => ({ decision: match, type: 'technical' })));
      }
    });
    
    return decisions;
  };

  const calculateImpactLevel = (message: any): 'low' | 'medium' | 'high' => {
    const content = message.content || '';
    const lowImpactKeywords = ['styling', 'css', 'color', 'layout'];
    const highImpactKeywords = ['database', 'migration', 'security', 'authentication', 'api'];
    
    const hasHighImpact = highImpactKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    const hasLowImpact = lowImpactKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    if (hasHighImpact) return 'high';
    if (hasLowImpact) return 'low';
    return 'medium';
  };

  const calculateSimilarityHash = (content: string): string => {
    // Simples hash para detectar similaridade
    const words = content.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const sortedWords = words.sort().slice(0, 10); // Primeiras 10 palavras relevantes
    return btoa(sortedWords.join('-')).substring(0, 16);
  };

  const extractTags = (content: string): string[] => {
    const tags: string[] = [];
    const techKeywords = [
      'react', 'typescript', 'tailwind', 'supabase', 'tanstack', 'component',
      'hook', 'page', 'api', 'database', 'migration', 'ui', 'form', 'table',
      'auth', 'security', 'performance', 'bug', 'feature', 'refactor'
    ];
    
    techKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return [...new Set(tags)];
  };

  // Buscar entradas similares
  const findSimilarEntries = useCallback(async (prompt: string, limit: number = 5) => {
    if (!projectHistory) return [];
    
    const promptHash = calculateSimilarityHash(prompt);
    const promptWords = prompt.toLowerCase().split(/\s+/);
    
    const similar = projectHistory
      .filter(entry => {
        // Verificar hash exato
        if (entry.similarity_hash === promptHash) return true;
        
        // Verificar similaridade por palavras-chave
        const entryWords = entry.prompt.toLowerCase().split(/\s+/);
        const commonWords = promptWords.filter(word => 
          entryWords.includes(word) && word.length > 2
        );
        
        return commonWords.length >= Math.min(3, promptWords.length * 0.3);
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    
    return similar;
  }, [projectHistory]);

  // Salvar nova entrada usando RPC
  const saveHistoryEntry = useMutation({
    mutationFn: async (entry: Omit<ProjectHistoryEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .rpc('insert_project_history', {
          ...entry,
          id: generateSessionId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return data;
    }
  });

  // Analisar padrões do histórico
  const analyzePatterns = useCallback(() => {
    if (!projectHistory) return {};
    
    const patterns = {
      mostCommonErrors: {} as Record<string, number>,
      frequentFiles: {} as Record<string, number>,
      technicalDecisions: {} as Record<string, number>,
      successPatterns: [] as any[],
      failurePatterns: [] as any[]
    };
    
    projectHistory.forEach(entry => {
      // Analisar erros mais comuns
      entry.errors_fixed.forEach(error => {
        patterns.mostCommonErrors[error] = (patterns.mostCommonErrors[error] || 0) + 1;
      });
      
      // Analisar arquivos mais modificados
      entry.files_modified.forEach(file => {
        patterns.frequentFiles[file] = (patterns.frequentFiles[file] || 0) + 1;
      });
      
      // Analisar decisões técnicas
      entry.technical_decisions.forEach(decision => {
        const key = decision.decision || decision;
        patterns.technicalDecisions[key] = (patterns.technicalDecisions[key] || 0) + 1;
      });
      
      // Analisar padrões de sucesso/falha
      if (entry.build_status === 'success') {
        patterns.successPatterns.push({
          prompt: entry.prompt,
          files: entry.files_modified,
          decisions: entry.technical_decisions
        });
      } else if (entry.build_status === 'failed') {
        patterns.failurePatterns.push({
          prompt: entry.prompt,
          errors: entry.errors_fixed,
          files: entry.files_modified
        });
      }
    });
    
    return patterns;
  }, [projectHistory]);

  return {
    projectHistory,
    isLoadingHistory,
    indexLovableHistory: indexLovableHistory.mutate,
    isIndexing: indexLovableHistory.isPending,
    findSimilarEntries,
    saveHistoryEntry: saveHistoryEntry.mutate,
    isSaving: saveHistoryEntry.isPending,
    analyzePatterns,
    currentSession,
    setCurrentSession
  };
};
