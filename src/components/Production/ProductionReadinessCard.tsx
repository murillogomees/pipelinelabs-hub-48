import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Circle } from 'lucide-react';
import { 
  getProductionReadiness, 
  calculateReadinessScore, 
  getProductionTodos,
  getCriticalMissingRequirements 
} from '@/utils/productionUtils';

export function ProductionReadinessCard() {
  const checklist = getProductionReadiness();
  const score = calculateReadinessScore(checklist);
  const todos = getProductionTodos();
  const criticalMissing = getCriticalMissingRequirements();

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = () => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Prontidão para Produção</span>
          <Badge variant={getScoreVariant()}>
            {score}% Completo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral</span>
            <span className={getScoreColor()}>{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Critical Missing Requirements */}
        {criticalMissing.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Requisitos críticos em falta:</strong>
              <ul className="mt-2 space-y-1">
                {criticalMissing.map((requirement, index) => (
                  <li key={index} className="text-sm">• {requirement}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Categories Status */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(checklist).map(([category, items]) => {
            const completed = Object.values(items).filter(Boolean).length;
            const total = Object.values(items).length;
            const categoryScore = Math.round((completed / total) * 100);
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium capitalize">
                    {category === 'database' ? 'Banco de Dados' :
                     category === 'security' ? 'Segurança' :
                     category === 'monitoring' ? 'Monitoramento' :
                     category === 'infrastructure' ? 'Infraestrutura' :
                     category}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {completed}/{total}
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(items).map(([item, completed]) => (
                    <div key={item} className="flex items-center space-x-2 text-sm">
                      {completed ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Circle className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={completed ? 'text-green-700' : 'text-gray-600'}>
                        {item.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* High Priority TODOs */}
        <div className="space-y-2">
          <h4 className="font-medium">Próximas Ações (Alta Prioridade)</h4>
          <div className="space-y-2">
            {todos
              .filter(todo => todo.priority === 'high')
              .slice(0, 4)
              .map((todo, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 border rounded text-sm">
                <Circle className="h-3 w-3 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <div className="font-medium">{todo.item}</div>
                  <div className="text-muted-foreground">{todo.description}</div>
                  {todo.manual && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Configuração Manual
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}