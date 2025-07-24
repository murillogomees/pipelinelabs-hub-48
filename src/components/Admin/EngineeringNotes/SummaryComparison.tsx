import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, X, Copy } from 'lucide-react';
import { NoteSummary } from '@/hooks/useEngineeringNotes';
import { useToast } from '@/hooks/use-toast';

interface SummaryComparisonProps {
  summaries: NoteSummary[];
  isGenerating: boolean;
  onClose: () => void;
}

const toneColors = {
  'Profissional e Empático': 'border-blue-500',
  'Didático': 'border-green-500',
  'Executivo': 'border-purple-500',
  'Documentação Técnica': 'border-orange-500',
};

const toneDescriptions = {
  'Profissional e Empático': 'Foco na clareza e impacto técnico',
  'Didático': 'Conceitos complexos em partes simples',
  'Executivo': 'Impactos de negócio, riscos e ROI',
  'Documentação Técnica': 'Estilo README ou RFC detalhado',
};

export function SummaryComparison({ summaries, isGenerating, onClose }: SummaryComparisonProps) {
  const { toast } = useToast();

  const copySummary = (summary: string, tone: string) => {
    navigator.clipboard.writeText(summary);
    toast({
      title: 'Copiado!',
      description: `Resumo "${tone}" copiado para a área de transferência`,
    });
  };

  if (isGenerating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gerando Resumos com IA
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Analisando sua visão técnica...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Gerando 4 resumos em diferentes tons
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summaries.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Comparação de Resumos por Tom
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {summaries.map((summary, index) => (
            <Card 
              key={index} 
              className={`border-2 ${toneColors[summary.tone as keyof typeof toneColors] || 'border-gray-300'}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{summary.tone}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {toneDescriptions[summary.tone as keyof typeof toneDescriptions]}
                    </p>
                  </div>
                  <Button
                    onClick={() => copySummary(summary.summary, summary.tone)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {summary.summary}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}