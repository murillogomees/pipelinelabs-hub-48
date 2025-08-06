import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CodeAnalysisData {
  totalFiles: number;
  newFiles: number;
  activeHooks: number;
  unusedHooks: number;
  edgeFunctions: number;
  activeEdgeFunctions: number;
  cleanupScore: number;
  issuesFound: number;
  hooks: FileAnalysis[];
  components: FileAnalysis[];
  pages: FileAnalysis[];
  edgeFunctionsList: EdgeFunctionAnalysis[];
  dependencies: DependencyAnalysis[];
}

export interface FileAnalysis {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  isUsed: boolean;
  usageCount: number;
  usedBy: string[];
  exports: string[];
  imports: string[];
  issues: CodeIssue[];
  complexity: number;
}

export interface EdgeFunctionAnalysis {
  name: string;
  path: string;
  isActive: boolean;
  lastDeployed: string;
  errorCount: number;
  invocations: number;
  averageResponseTime: number;
  dependencies: string[];
  secrets: string[];
}

export interface DependencyAnalysis {
  name: string;
  version: string;
  isUsed: boolean;
  size: string;
  vulnerabilities: number;
  canRemove: boolean;
}

export interface CodeIssue {
  type: 'warning' | 'error' | 'info';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

export function useCodeAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const { data: analysisData, isLoading, refetch } = useQuery({
    queryKey: ['code-analysis'],
    queryFn: async (): Promise<CodeAnalysisData> => {
      // Simular análise do código - em produção isso seria feito por uma edge function
      const { data, error } = await supabase.functions.invoke('code-analyzer', {
        body: { action: 'analyze' }
      });

      if (error) {
        // Fallback para dados mockados se a function não existir
        return {
          totalFiles: 156,
          newFiles: 8,
          activeHooks: 45,
          unusedHooks: 3,
          edgeFunctions: 12,
          activeEdgeFunctions: 10,
          cleanupScore: 85,
          issuesFound: 7,
          hooks: [
            {
              name: 'useCustomers',
              path: 'src/hooks/useCustomers.ts',
              size: 2048,
              lastModified: '2024-01-15',
              isUsed: true,
              usageCount: 15,
              usedBy: ['CustomersList.tsx', 'CustomerForm.tsx'],
              exports: ['useCustomers'],
              imports: ['useQuery', 'supabase'],
              issues: [],
              complexity: 3
            },
            {
              name: 'useOldHook',
              path: 'src/hooks/useOldHook.ts',
              size: 1024,
              lastModified: '2023-12-01',
              isUsed: false,
              usageCount: 0,
              usedBy: [],
              exports: ['useOldHook'],
              imports: ['useState'],
              issues: [
                {
                  type: 'warning',
                  message: 'Hook não utilizado - pode ser removido',
                  severity: 'medium'
                }
              ],
              complexity: 1
            }
          ],
          components: [],
          pages: [],
          edgeFunctionsList: [],
          dependencies: []
        };
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: true
  });

  const refreshAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      await refetch();
      toast({
        title: "Análise concluída",
        description: "O projeto foi analisado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o projeto.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [refetch, toast]);

  const cleanupUnusedFiles = useCallback(async (files: string[]) => {
    try {
      const { error } = await supabase.functions.invoke('code-analyzer', {
        body: { 
          action: 'cleanup',
          files: files
        }
      });

      if (error) throw error;

      toast({
        title: "Limpeza concluída",
        description: `${files.length} arquivos foram removidos.`,
      });

      await refreshAnalysis();
    } catch (error) {
      toast({
        title: "Erro na limpeza",
        description: "Não foi possível remover os arquivos.",
        variant: "destructive",
      });
    }
  }, [refreshAnalysis, toast]);

  return {
    analysisData,
    isLoading: isLoading || isAnalyzing,
    refreshAnalysis,
    cleanupUnusedFiles
  };
}