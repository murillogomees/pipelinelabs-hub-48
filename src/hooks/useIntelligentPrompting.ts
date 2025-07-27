
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
      // Analyze similar prompts from history
      const similarPrompts = analyzeSimilarPrompts(prompt);
      const patterns = getPatternAnalysis();

      // Calculate confidence based on historical data
      let confidence = 0.5; // Base confidence
      
      if (similarPrompts.length > 0) {
        const successfulSimilar = similarPrompts.filter(p => p.success);
        confidence = successfulSimilar.length / similarPrompts.length;
      }

      // Predict expected files based on patterns
      const expectedFiles = predictFilesFromPrompt(prompt, similarPrompts);
      
      // Estimate execution time
      const estimatedTime = estimateExecutionTime(prompt, similarPrompts);

      // Generate reasoning
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
    const filePatterns = new Map<string, number>();
    
    similarPrompts.forEach(entry => {
      if (Array.isArray(entry.files_modified)) {
        entry.files_modified.forEach(file => {
          filePatterns.set(file, (filePatterns.get(file) || 0) + 1);
        });
      }
    });

    // Return most common files
    return Array.from(filePatterns.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([file]) => file);
  };

  const estimateExecutionTime = (prompt: string, similarPrompts: any[]): number => {
    if (similarPrompts.length === 0) return 5000;

    const avgTime = similarPrompts.reduce((sum, entry) => sum + entry.execution_time, 0) / similarPrompts.length;
    
    // Adjust based on prompt complexity
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
    // Find successful patterns
    const successfulPrompts = similarPrompts.filter(p => p.success);
    
    if (successfulPrompts.length === 0) return prompt;

    // Extract common successful patterns
    const commonPatterns = findCommonPatterns(successfulPrompts.map(p => p.prompt));
    
    // Suggest improvements
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
      return 'Prompt único - sem histórico similar para análise';
    }

    const successRate = similarPrompts.filter(p => p.success).length / similarPrompts.length;
    const avgTime = similarPrompts.reduce((sum, entry) => sum + entry.execution_time, 0) / similarPrompts.length;
    
    return `Baseado em ${similarPrompts.length} prompts similares com ${(successRate * 100).toFixed(1)}% de sucesso. Tempo médio: ${(avgTime / 1000).toFixed(1)}s`;
  };

  const generateInsights = (): IntelligentInsight[] => {
    const newInsights: IntelligentInsight[] = [];
    const patterns = getPatternAnalysis();

    if (!patterns) return newInsights;

    // Success rate insight
    if (patterns.successRate < 70) {
      newInsights.push({
        type: 'warning',
        message: `Taxa de sucesso baixa (${patterns.successRate.toFixed(1)}%). Considere prompts mais específicos.`,
        confidence: 0.8,
        actionable: true
      });
    }

    // Performance insight
    if (patterns.averageExecutionTime > 10000) {
      newInsights.push({
        type: 'optimization',
        message: `Tempo médio de execução alto (${(patterns.averageExecutionTime / 1000).toFixed(1)}s). Divida tarefas complexas.`,
        confidence: 0.7,
        actionable: true
      });
    }

    // Pattern suggestion
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
    
    // Context-based suggestions
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
    // Mock implementation for now
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
