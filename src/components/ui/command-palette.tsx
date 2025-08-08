
import React, { useState, useEffect, useCallback } from 'react';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { 
  Bot, 
  Code, 
  Loader2, 
  Wand2, 
  Copy, 
  Check, 
  Play,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const [mode, setMode] = useState<'search' | 'prompt' | 'result'>('search');
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { 
    generateCode, 
    isGenerating, 
    applyCode, 
    isApplying 
  } = usePromptGenerator();

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setMode('search');
      setPrompt('');
      setGeneratedCode(null);
      setCopiedId(null);
    }
  }, [open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleGenerateCode = async () => {
    if (!prompt.trim()) return;
    
    const result = await generateCode(prompt);
    if (result) {
      setGeneratedCode(result);
      setMode('result');
    }
  };

  const handleCopyCode = useCallback(async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, []);

  const handleApplyCode = () => {
    if (generatedCode?.logId) {
      applyCode(generatedCode.logId);
    }
  };

  const quickActions = [
    { id: 'create-component', label: 'Criar Componente', icon: Code, prompt: 'Criar um novo componente React com TypeScript' },
    { id: 'create-hook', label: 'Criar Hook', icon: Sparkles, prompt: 'Criar um hook customizado para' },
    { id: 'create-page', label: 'Criar Página', icon: ExternalLink, prompt: 'Criar uma nova página com' },
    { id: 'create-api', label: 'Criar API', icon: Bot, prompt: 'Criar uma edge function para' }
  ];

  const renderSearchMode = () => (
    <>
      <CommandInput placeholder="Digite um comando ou use ações rápidas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Ações Rápidas">
          {quickActions.map((action) => (
            <CommandItem
              key={action.id}
              onSelect={() => {
                setPrompt(action.prompt);
                setMode('prompt');
              }}
              className="flex items-center gap-3"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Geração de Código">
          <CommandItem
            onSelect={() => setMode('prompt')}
            className="flex items-center gap-3"
          >
            <Wand2 className="h-4 w-4" />
            <span>Prompt Personalizado</span>
            <Badge variant="secondary" className="ml-auto">IA</Badge>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );

  const renderPromptMode = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5" />
        <h3 className="font-semibold">Gerador de Código IA</h3>
        <Badge variant="outline">GPT-4o Mini</Badge>
      </div>
      
      <Textarea
        placeholder="Descreva o que você quer criar..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px]"
        autoFocus
      />
      
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleGenerateCode}
          disabled={!prompt.trim() || isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Gerar Código
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setMode('search')}
        >
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderResultMode = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <h3 className="font-semibold">Código Gerado</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMode('prompt')}
        >
          Novo Prompt
        </Button>
      </div>

      {generatedCode && (
        <div className="space-y-4">
          {/* Description */}
          {generatedCode.description && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{generatedCode.description}</p>
            </div>
          )}

          {/* Files */}
          {generatedCode.files && Object.keys(generatedCode.files).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Arquivos:</h4>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {Object.entries(generatedCode.files).map(([filename, content]) => (
                    <div key={filename} className="border rounded-lg">
                      <div className="flex items-center justify-between p-2 bg-muted/50">
                        <span className="text-sm font-mono">{filename}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(content as string, filename)}
                        >
                          {copiedId === filename ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <pre className="p-2 text-xs overflow-x-auto">
                        <code>{String(content).substring(0, 500)}...</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleApplyCode}
              disabled={isApplying}
              className="flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Aplicar Código
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                if (generatedCode.files) {
                  const allCode = Object.entries(generatedCode.files)
                    .map(([filename, content]) => `// ${filename}\n${content}`)
                    .join('\n\n');
                  handleCopyCode(allCode, 'all');
                }
              }}
            >
              {copiedId === 'all' ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copiar Tudo
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      {mode === 'search' && renderSearchMode()}
      {mode === 'prompt' && renderPromptMode()}
      {mode === 'result' && renderResultMode()}
    </CommandDialog>
  );
};
