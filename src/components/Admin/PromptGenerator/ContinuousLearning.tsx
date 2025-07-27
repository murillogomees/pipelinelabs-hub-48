
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';
import { useProjectHistory } from '@/hooks/useProjectHistory';
import { useIntelligentPrompting } from '@/hooks/useIntelligentPrompting';

export function ContinuousLearning() {
  const { history, getContinuousLearningData, getLearningInsights } = useProjectHistory();
  const { insights, generateInsights } = useIntelligentPrompting();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [learningData, setLearningData] = useState<any>(null);

  useEffect(() => {
    const data = getContinuousLearningData();
    setLearningData(data);
  }, [history]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      generateInsights();
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'suggestion': return Lightbulb;
      case 'optimization': return Zap;
      default: return CheckCircle;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500';
      case 'suggestion': return 'bg-blue-500';
      case 'optimization': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!learningData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Aprendizado Contínuo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando dados de aprendizado...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Execuções Totais</p>
                <p className="text-2xl font-bold">{learningData.totalExecutions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">{learningData.successRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={learningData.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Padrões Aprendidos</p>
                <p className="text-2xl font-bold">{Object.keys(learningData.commonPatterns).length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Melhorias Ativas</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Padrões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Padrões Identificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(learningData.commonPatterns).length > 0 ? (
              Object.entries(learningData.commonPatterns)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([pattern, count]) => (
                  <div key={pattern} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{pattern}</p>
                      <p className="text-sm text-muted-foreground">Padrão frequente</p>
                    </div>
                    <Badge variant="secondary">{count} vezes</Badge>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum padrão identificado ainda</p>
                <p className="text-sm">Execute mais prompts para começar o aprendizado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights Inteligentes
            </CardTitle>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analisar Agora
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className={`p-2 rounded-full ${getInsightColor(insight.type)} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {(insight.confidence * 100).toFixed(0)}% confiança
                        </span>
                      </div>
                      <p className="text-sm">{insight.message}</p>
                      {insight.actionable && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Ação recomendada
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum insight disponível</p>
                <p className="text-sm">Execute a análise para gerar insights</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tendências Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendências Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningData.recentTrends.slice(0, 5).map((trend: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{trend.action_type}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {trend.prompt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={trend.success ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {trend.success ? 'Sucesso' : 'Falha'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {(trend.execution_time / 1000).toFixed(1)}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
