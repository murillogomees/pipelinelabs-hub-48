
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';

interface PromptEditorProps {
  onGenerate: (params: {
    prompt: string;
    temperature: number;
    model: string;
  }) => void;
  isGenerating: boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  onGenerate,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState([0.7]);
  const [model, setModel] = useState('gpt-4o-mini');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      temperature: temperature[0],
      model
    });
  };

  const examplePrompts = [
    'Criar CRUD de produtos com nome, preço e status',
    'Implementar sistema de notificações com WebSocket',
    'Criar dashboard de vendas com gráficos',
    'Adicionar autenticação 2FA com QR Code'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Gerador de Código com IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt em linguagem natural</Label>
            <Textarea
              id="prompt"
              placeholder="Descreva a funcionalidade que você deseja implementar..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isGenerating}
            />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Exemplos de prompts:</p>
              <ul className="space-y-1">
                {examplePrompts.map((example, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="text-primary hover:underline text-left"
                      onClick={() => setPrompt(example)}
                      disabled={isGenerating}
                    >
                      • {example}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Select value={model} onValueChange={setModel} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini (Rápido)</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o (Avançado)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4 (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">
                Temperatura: {temperature[0]}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onValueChange={setTemperature}
                disabled={isGenerating}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Menor = mais focado, Maior = mais criativo
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando código...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Gerar com IA
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
