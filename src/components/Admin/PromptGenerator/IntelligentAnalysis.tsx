
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Lightbulb, 
  History, 
  TrendingUp, 
  Code2, 
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { LearningContext, SimilarSolution, KnowledgeEntry, Pattern } from './types';

interface IntelligentAnalysisProps {
  context: LearningContext;
  originalPrompt: string;
  onUseSimilarSolution: (solution: SimilarSolution) => void;
  onApplyKnowledge: (entry: KnowledgeEntry) => void;
  onApplyPattern: (pattern: Pattern) => void;
}

export const IntelligentAnalysis: React.FC<IntelligentAnalysisProps> = ({
  context,
  originalPrompt,
  onUseSimilarSolution,
  onApplyKnowledge,
  onApplyPattern
}) => {
  const { similarSolutions, knowledgeBase, patterns, suggestions } = context;

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.7) return 'bg-green-100 text-green-800';
    if (similarity >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Análise Inteligente</h3>
      </div>

      {/* Sugestões gerais */}
      {suggestions.length > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Soluções similares */}
      {similarSolutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Soluções Similares Encontradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {similarSolutions.map((solution, index) => (
                <div key={solution.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {solution.prompt}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Usado {solution.usage_count} vezes • Última vez: {new Date(solution.last_used).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSimilarityColor(solution.similarity)}>
                        {Math.round(solution.similarity * 100)}% similar
                      </Badge>
                      <Badge className={getEffectivenessColor(solution.effectiveness_score)}>
                        {Math.round(solution.effectiveness_score * 100)}% eficaz
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {solution.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUseSimilarSolution(solution)}
                    >
                      <Code2 className="h-3 w-3 mr-1" />
                      Reaproveitar Solução
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Base de conhecimento */}
      {knowledgeBase.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Base de Conhecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {knowledgeBase.map((entry, index) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{entry.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Categoria: {entry.category} • Usado {entry.usage_count} vezes
                      </p>
                    </div>
                    <Badge variant="outline">
                      {Math.round(entry.success_rate * 100)}% sucesso
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Arquivos afetados: {entry.files_affected.join(', ')}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyKnowledge(entry)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Aplicar Conhecimento
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Padrões detectados */}
      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Padrões Arquiteturais Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <div key={pattern.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{pattern.description}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tipo: {pattern.pattern_type}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {Math.round(pattern.confidence_score * 100)}% confiança
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Palavras-chave: {pattern.trigger_keywords.join(', ')}
                  </div>

                  <div className="bg-muted p-2 rounded text-xs">
                    <strong>Solução recomendada:</strong> {pattern.recommended_solution}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyPattern(pattern)}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Aplicar Padrão
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Caso não haja contexto */}
      {similarSolutions.length === 0 && knowledgeBase.length === 0 && patterns.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta é uma solicitação nova! Vou criar uma nova entrada na base de conhecimento para futuras consultas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
