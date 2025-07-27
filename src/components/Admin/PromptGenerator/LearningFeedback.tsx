
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';

interface LearningFeedbackProps {
  onFeedback: (feedback: 'positive' | 'negative', comment?: string) => void;
  sessionSummary: string;
}

export const LearningFeedback: React.FC<LearningFeedbackProps> = ({
  onFeedback,
  sessionSummary
}) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = () => {
    if (feedback) {
      onFeedback(feedback, comment);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">Obrigado pelo feedback!</p>
            <p className="text-green-700 text-sm mt-1">
              Sua avaliação ajuda a melhorar o sistema de IA.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Avalie esta Implementação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Resumo da sessão:</strong> {sessionSummary}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Como você avalia esta implementação?</p>
          
          <div className="flex gap-3">
            <Button
              variant={feedback === 'positive' ? 'default' : 'outline'}
              onClick={() => setFeedback('positive')}
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Positiva
            </Button>
            <Button
              variant={feedback === 'negative' ? 'destructive' : 'outline'}
              onClick={() => setFeedback('negative')}
              className="flex-1"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Negativa
            </Button>
          </div>

          {feedback && (
            <div className="space-y-3">
              <Textarea
                placeholder="Comentários adicionais (opcional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              
              <Button onClick={handleSubmitFeedback} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Feedback
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Por que seu feedback é importante:</strong>
          </p>
          <ul className="mt-1 space-y-1">
            <li>• Melhora a precisão das próximas implementações</li>
            <li>• Ajuda a identificar padrões de sucesso</li>
            <li>• Contribui para a base de conhecimento do sistema</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
