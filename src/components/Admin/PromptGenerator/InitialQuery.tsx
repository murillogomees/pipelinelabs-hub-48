
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';

export interface InitialQueryProps {
  onSubmit: (prompt: string) => void;
}

export const InitialQuery: React.FC<InitialQueryProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">O que você gostaria de implementar?</h3>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="prompt">Descreva sua solicitação</Label>
        <Textarea
          id="prompt"
          placeholder="Ex: Adicionar validação de CPF no formulário de clientes..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px]"
        />
      </div>
      
      <Button 
        onClick={handleSubmit}
        disabled={!prompt.trim()}
        className="w-full"
      >
        <Send className="h-4 w-4 mr-2" />
        Analisar Solicitação
      </Button>
    </div>
  );
};
