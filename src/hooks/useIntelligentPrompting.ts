import { useState, useEffect } from 'react';
import { useProjectHistory } from './useProjectHistory';

export interface PromptPrediction {
  confidence: number;
  suggestedPrompt: string;
  reasoning: string;
  expectedFiles: string[];
  estimatedTime: number;
}

export interface IntelligentInsight {
  type: 'warning' | 'suggestion' | 'optimization';
  message: string;
  confidence: number;
  actionable: boolean;
}

export function useIntelligentPrompting() {
  const { history, getPatternAnalysis, analyzeSimilarPrompts } = useProjectHistory();
  const [predictions, setPredictions] = useState<PromptPrediction[]>([]);
  const [insights, setInsights] = useState<IntelligentInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePrompt = async (prompt: string): Promise<PromptPrediction> => {
    setIsAnalyzing(true);

    try {
      const similarPrompts = analyzeSimilarPrompts(prompt);
      const patterns = getPatternAnalysis();

      let confidence = 0.5;
      
      if (similarPrompts.length > 0) {
        const successfulSimilar = similarPrompts.filter(p => p.success);
        confidence = successfulSimilar.length / similarPrompts.length;
      }

      const expectedFiles = predictFilesFromPrompt(prompt, similarPrompts);
      const estimatedTime = estimateExecutionTime(prompt, similarPrompts);
      const reasoning = generateReasoning(prompt, similarPrompts, patterns);

      const prediction: PromptPrediction = {
        confidence,
        suggestedPrompt: optimizePrompt(prompt, similarPrompts),
        reasoning,
        expectedFiles,
        estimatedTime
      };

      return prediction;
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      return {
        confidence: 0.5,
        suggestedPrompt: prompt,
        reasoning: 'Análise não disponível',
        expectedFiles: [],
        estimatedTime: 5000
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  const predictFilesFromPrompt = (prompt: string, similarPrompts: any[]): string[] => {
    const lowerPrompt = prompt.toLowerCase();
    const predictedFiles: string[] = [];
    
    // Analisar o prompt para gerar nomes de arquivos específicos
    const words = lowerPrompt.split(' ').filter(word => word.length > 2);
    
    // Gerar nome base baseado no prompt
    const baseNames = extractMeaningfulWords(prompt);
    
    // Prever arquivos baseado no tipo de solicitação
    if (lowerPrompt.includes('component') || lowerPrompt.includes('criar') && lowerPrompt.includes('botão')) {
      const componentName = generateComponentName(baseNames);
      predictedFiles.push(`src/components/${componentName}.tsx`);
    }
    
    if (lowerPrompt.includes('hook') || lowerPrompt.includes('use')) {
      const hookName = generateHookName(baseNames);
      predictedFiles.push(`src/hooks/${hookName}.ts`);
    }
    
    if (lowerPrompt.includes('página') || lowerPrompt.includes('page') || lowerPrompt.includes('rota')) {
      const pageName = generatePageName(baseNames);
      predictedFiles.push(`src/pages/${pageName}.tsx`);
    }
    
    if (lowerPrompt.includes('api') || lowerPrompt.includes('função') || lowerPrompt.includes('endpoint')) {
      const functionName = generateFunctionName(baseNames);
      predictedFiles.push(`supabase/functions/${functionName}/index.ts`);
    }
    
    if (lowerPrompt.includes('utilitário') || lowerPrompt.includes('util') || lowerPrompt.includes('helper')) {
      const utilName = generateUtilName(baseNames);
      predictedFiles.push(`src/utils/${utilName}.ts`);
    }
    
    if (lowerPrompt.includes('tipo') || lowerPrompt.includes('interface') || lowerPrompt.includes('type')) {
      const typeName = generateTypeName(baseNames);
      predictedFiles.push(`src/types/${typeName}.ts`);
    }
    
    // Se não conseguiu prever nada específico, usar padrões dos prompts similares
    if (predictedFiles.length === 0 && similarPrompts.length > 0) {
      const filePatterns = new Map<string, number>();
      
      similarPrompts.forEach(entry => {
        if (Array.isArray(entry.files_modified)) {
          entry.files_modified.forEach(file => {
            filePatterns.set(file, (filePatterns.get(file) || 0) + 1);
          });
        }
      });

      const topFiles = Array.from(filePatterns.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([file]) => file);
        
      predictedFiles.push(...topFiles);
    }

    return predictedFiles;
  };

  const extractMeaningfulWords = (prompt: string): string[] => {
    const words = prompt.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !isStopWord(word));
    
    return words.slice(0, 3); // Pegar apenas as 3 palavras mais relevantes
  };

  const isStopWord = (word: string): boolean => {
    const stopWords = ['criar', 'fazer', 'adicionar', 'implementar', 'desenvolver', 'para', 'com', 'uma', 'um', 'que', 'de', 'da', 'do', 'na', 'no', 'em', 'por', 'ser', 'ter', 'este', 'essa', 'isso'];
    return stopWords.includes(word);
  };

  const generateComponentName = (baseNames: string[]): string => {
    if (baseNames.length === 0) return 'CustomComponent';
    const name = baseNames.map(word => capitalizeFirst(word)).join('');
    return `${name}Component`;
  };

  const generateHookName = (baseNames: string[]): string => {
    if (baseNames.length === 0) return 'useCustomHook';
    const name = baseNames.map(word => capitalizeFirst(word)).join('');
    return `use${name}`;
  };

  const generatePageName = (baseNames: string[]): string => {
    if (baseNames.length === 0) return 'CustomPage';
    const name = baseNames.map(word => capitalizeFirst(word)).join('');
    return `${name}Page`;
  };

  const generateFunctionName = (baseNames: string[]): string => {
    if (baseNames.length === 0) return 'custom-function';
    return baseNames.join('-').toLowerCase();
  };

  const generateUtilName = (baseNames: string[]): string => {
    if (baseNames.length === 0) return 'customUtils';
    const name = baseNames.map(word => capitalizeFirst(word)).join('');
    return `${name}Utils`;
  };

  const generateTypeName = (baseNames: string[]): string => {
    if (baseNames.length === 0) return 'customTypes';
    const name = baseNames.map(word => capitalizeFirst(word)).join('');
    return `${name}Types`;
  };

  const capitalizeFirst = (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const estimateExecutionTime = (prompt: string, similarPrompts: any[]): number => {
    if (similarPrompts.length === 0) return 5000;

    const avgTime = similarPrompts.reduce((sum, entry) => sum + entry.execution_time, 0) / similarPrompts.length;
    
    const complexity = calculatePromptComplexity(prompt);
    return Math.round(avgTime * complexity);
  };

  const calculatePromptComplexity = (prompt: string): number => {
    const words = prompt.split(/\s+/).length;
    const hasCodeKeywords = /\b(component|hook|function|class|interface|type)\b/i.test(prompt);
    const hasMultipleActions = /\b(and|also|additionally|then|next)\b/i.test(prompt);
    
    let complexity = 1;
    
    if (words > 50) complexity += 0.3;
    if (hasCodeKeywords) complexity += 0.2;
    if (hasMultipleActions) complexity += 0.4;
    
    return Math.min(complexity, 2);
  };

  const optimizePrompt = (prompt: string, similarPrompts: any[]): string => {
    const successfulPrompts = similarPrompts.filter(p => p.success);
    
    if (successfulPrompts.length === 0) return prompt;

    const commonPatterns = findCommonPatterns(successfulPrompts.map(p => p.prompt));
    
    let optimizedPrompt = prompt;
    
    if (!prompt.includes('TypeScript') && commonPatterns.includes('TypeScript')) {
      optimizedPrompt += ' (use TypeScript)';
    }
    
    if (!prompt.includes('responsive') && commonPatterns.includes('responsive')) {
      optimizedPrompt += ' (make it responsive)';
    }

    return optimizedPrompt;
  };

  const findCommonPatterns = (prompts: string[]): string[] => {
    const patterns: string[] = [];
    const keywords = ['TypeScript', 'responsive', 'component', 'hook', 'Tailwind', 'shadcn'];
    
    keywords.forEach(keyword => {
      const count = prompts.filter(p => p.includes(keyword)).length;
      if (count > prompts.length * 0.6) {
        patterns.push(keyword);
      }
    });
    
    return patterns;
  };

  const generateReasoning = (prompt: string, similarPrompts: any[], patterns: any): string => {
    if (similarPrompts.length === 0) {
      return 'Prompt único - analisando baseado em padrões do projeto';
    }

    const successRate = similarPrompts.filter(p => p.success).length / similarPrompts.length;
    const avgTime = similarPrompts.reduce((sum, entry) => sum + entry.execution_time, 0) / similarPrompts.length;
    
    return `Baseado em ${similarPrompts.length} prompts similares com ${(successRate * 100).toFixed(1)}% de sucesso. Tempo médio: ${(avgTime / 1000).toFixed(1)}s`;
  };

  const generateInsights = (): IntelligentInsight[] => {
    const newInsights: IntelligentInsight[] = [];
    const patterns = getPatternAnalysis();

    if (!patterns) return newInsights;

    if (patterns.successRate < 70) {
      newInsights.push({
        type: 'warning',
        message: `Taxa de sucesso baixa (${patterns.successRate.toFixed(1)}%). Considere prompts mais específicos.`,
        confidence: 0.8,
        actionable: true
      });
    }

    if (patterns.averageExecutionTime > 10000) {
      newInsights.push({
        type: 'optimization',
        message: `Tempo médio de execução alto (${(patterns.averageExecutionTime / 1000).toFixed(1)}s). Divida tarefas complexas.`,
        confidence: 0.7,
        actionable: true
      });
    }

    const topActions = Object.entries(patterns.mostCommonActions)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 1);

    if (topActions.length > 0) {
      newInsights.push({
        type: 'suggestion',
        message: `Ação mais comum: ${topActions[0][0]}. Considere criar templates para esse tipo de tarefa.`,
        confidence: 0.6,
        actionable: true
      });
    }

    return newInsights;
  };

  const getIntelligentSuggestions = (context: string) => {
    if (!Array.isArray(history)) return [];
    
    const suggestions = [];
    
    if (context.includes('component') && !context.includes('TypeScript')) {
      suggestions.push('Considere especificar TypeScript para melhor tipagem');
    }
    
    if (context.includes('form') && !context.includes('validation')) {
      suggestions.push('Adicione validação de formulário para melhor UX');
    }
    
    if (context.includes('API') && !context.includes('error')) {
      suggestions.push('Implemente tratamento de erro para chamadas API');
    }

    return suggestions;
  };

  const saveExecutionContext = async (context: any) => {
    console.log('Saving execution context:', context);
  };

  useEffect(() => {
    const newInsights = generateInsights();
    setInsights(newInsights);
  }, [history]);

  return {
    predictions,
    insights,
    isAnalyzing,
    analyzePrompt,
    getIntelligentSuggestions,
    generateInsights: () => generateInsights(),
    saveExecutionContext
  };
}
