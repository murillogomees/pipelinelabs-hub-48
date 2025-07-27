
import { useState, useCallback } from 'react';
import { useProjectHistory } from './useProjectHistory';
import { useLearningSystem } from './useLearningSystem';

interface IntelligentPromptResult {
  shouldProceed: boolean;
  reason: string;
  suggestions: string[];
  alternatives: any[];
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}

interface RedundancyCheck {
  isRedundant: boolean;
  existingImplementation?: any;
  similarityScore: number;
  recommendation: string;
}

export const useIntelligentPrompting = () => {
  const { findSimilarEntries, saveHistoryEntry, analyzePatterns } = useProjectHistory();
  const { analyzeContext, findSimilarSolutions } = useLearningSystem();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Análise inteligente pré-execução
  const analyzePrompt = useCallback(async (prompt: string): Promise<IntelligentPromptResult> => {
    setIsAnalyzing(true);
    
    try {
      // Buscar implementações similares
      const similarEntries = await findSimilarEntries(prompt, 10);
      const patterns = analyzePatterns();
      
      // Verificar redundância
      const redundancyCheck = await checkRedundancy(prompt, similarEntries);
      
      // Analisar risco
      const riskAnalysis = analyzeRisk(prompt, similarEntries, patterns);
      
      // Gerar sugestões
      const suggestions = generateIntelligentSuggestions(prompt, similarEntries, patterns);
      
      // Calcular confiança
      const confidence = calculateConfidence(similarEntries, patterns, riskAnalysis);
      
      const result: IntelligentPromptResult = {
        shouldProceed: !redundancyCheck.isRedundant && riskAnalysis.level !== 'high',
        reason: redundancyCheck.isRedundant 
          ? `Implementação similar já existe: ${redundancyCheck.recommendation}`
          : riskAnalysis.level === 'high' 
            ? `Risco alto detectado: ${riskAnalysis.reason}`
            : 'Análise aprovada para prosseguir',
        suggestions,
        alternatives: redundancyCheck.isRedundant ? [redundancyCheck.existingImplementation] : [],
        riskLevel: riskAnalysis.level,
        confidence
      };
      
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, [findSimilarEntries, analyzePatterns]);

  // Verificar redundâncias
  const checkRedundancy = async (prompt: string, similarEntries: any[]): Promise<RedundancyCheck> => {
    const promptKeywords = extractKeywords(prompt);
    
    for (const entry of similarEntries) {
      const entryKeywords = extractKeywords(entry.prompt);
      const similarity = calculateSimilarity(promptKeywords, entryKeywords);
      
      if (similarity > 0.8) {
        return {
          isRedundant: true,
          existingImplementation: entry,
          similarityScore: similarity,
          recommendation: `Implementação similar já existe. Considere reutilizar ou refinar a solução anterior.`
        };
      }
    }
    
    return {
      isRedundant: false,
      similarityScore: 0,
      recommendation: 'Nenhuma redundância detectada'
    };
  };

  // Análise de risco
  const analyzeRisk = (prompt: string, similarEntries: any[], patterns: any) => {
    const riskFactors = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    // Verificar se afeta arquivos críticos
    const criticalFiles = ['database', 'migration', 'auth', 'security', 'api'];
    const affectsCritical = criticalFiles.some(file => 
      prompt.toLowerCase().includes(file)
    );
    
    if (affectsCritical) {
      riskFactors.push('Afeta componentes críticos do sistema');
      riskLevel = 'high';
    }
    
    // Verificar histórico de erros
    const hasErrorHistory = similarEntries.some(entry => 
      entry.build_status === 'failed' || entry.errors_fixed.length > 0
    );
    
    if (hasErrorHistory) {
      riskFactors.push('Histórico de erros em implementações similares');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }
    
    // Verificar complexidade
    const complexityKeywords = ['refactor', 'restructure', 'architecture', 'multiple'];
    const isComplex = complexityKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    
    if (isComplex) {
      riskFactors.push('Implementação complexa detectada');
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    }
    
    return {
      level: riskLevel,
      factors: riskFactors,
      reason: riskFactors.join(', ') || 'Nenhum fator de risco detectado'
    };
  };

  // Gerar sugestões inteligentes
  const generateIntelligentSuggestions = (
    prompt: string, 
    similarEntries: any[], 
    patterns: any
  ): string[] => {
    const suggestions: string[] = [];
    
    // Sugestões baseadas em sucessos anteriores
    const successfulEntries = similarEntries.filter(entry => 
      entry.build_status === 'success'
    );
    
    if (successfulEntries.length > 0) {
      suggestions.push(
        `Baseie-se na implementação bem-sucedida: "${successfulEntries[0].prompt.substring(0, 50)}..."`
      );
    }
    
    // Sugestões baseadas em erros comuns
    const commonErrors = Object.entries(patterns.mostCommonErrors || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    if (commonErrors.length > 0) {
      suggestions.push(
        `Atenção aos erros comuns: ${commonErrors.map(([error]) => error.substring(0, 30)).join(', ')}`
      );
    }
    
    // Sugestões baseadas em arquivos frequentes
    const frequentFiles = Object.entries(patterns.frequentFiles || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    if (frequentFiles.length > 0) {
      suggestions.push(
        `Considere impacto nos arquivos frequentemente modificados: ${frequentFiles.map(([file]) => file).join(', ')}`
      );
    }
    
    // Sugestões baseadas em decisões técnicas
    const technicalDecisions = Object.entries(patterns.technicalDecisions || {})
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2);
    
    if (technicalDecisions.length > 0) {
      suggestions.push(
        `Padrões técnicos recomendados: ${technicalDecisions.map(([decision]) => decision).join(', ')}`
      );
    }
    
    return suggestions;
  };

  // Calcular confiança
  const calculateConfidence = (
    similarEntries: any[], 
    patterns: any, 
    riskAnalysis: any
  ): number => {
    let confidence = 0.5; // Base
    
    // Aumentar confiança com histórico de sucesso
    const successRate = similarEntries.length > 0 
      ? similarEntries.filter(entry => entry.build_status === 'success').length / similarEntries.length
      : 0;
    
    confidence += successRate * 0.3;
    
    // Diminuir confiança com risco
    if (riskAnalysis.level === 'high') {
      confidence -= 0.3;
    } else if (riskAnalysis.level === 'medium') {
      confidence -= 0.1;
    }
    
    // Aumentar confiança com padrões estáveis
    if (patterns.successPatterns?.length > 5) {
      confidence += 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  };

  // Extrair palavras-chave
  const extractKeywords = (text: string): string[] => {
    const stopWords = ['o', 'a', 'de', 'para', 'com', 'em', 'um', 'uma', 'do', 'da', 'que', 'e', 'é'];
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  };

  // Calcular similaridade
  const calculateSimilarity = (keywords1: string[], keywords2: string[]): number => {
    const intersection = keywords1.filter(word => keywords2.includes(word));
    const union = [...new Set([...keywords1, ...keywords2])];
    return intersection.length / union.length;
  };

  // Salvar contexto da execução
  const saveExecutionContext = useCallback(async (
    prompt: string,
    result: any,
    filesModified: string[],
    errorsFixed: string[]
  ) => {
    await saveHistoryEntry({
      user_id: '', // Será preenchido pelo hook
      company_id: '', // Será preenchido pelo hook
      session_id: `session_${Date.now()}`,
      prompt,
      response: result,
      files_modified: filesModified,
      errors_fixed: errorsFixed,
      build_status: result.success ? 'success' : 'failed',
      technical_decisions: result.technical_decisions || [],
      impact_level: result.impact_level || 'medium',
      similarity_hash: '', // Será calculado pelo hook
      tags: result.tags || []
    });
  }, [saveHistoryEntry]);

  return {
    analyzePrompt,
    saveExecutionContext,
    isAnalyzing
  };
};
