import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, MapPin, User, Heart, Clock } from 'lucide-react';
import { PipelineLabsLogo } from '@/components/Layout/PipelineLabsLogo';
import carlaPersona from '@/assets/carla-persona.jpg';

interface PersonaCardProps {
  className?: string;
}

export function PersonaCard({ className = '' }: PersonaCardProps) {
  return (
    <Card className={`overflow-hidden shadow-lg h-[500px] ${className}`}>
      <CardContent className="p-0">
        {/* Foto da persona */}
        <div className="relative">
          <img 
            src={carlaPersona} 
            alt="Carla - Empreendedora de salgados artesanais" 
            className="w-full h-40 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-bold text-xl">Carla Santos</h3>
            <p className="text-white/90 text-sm">Fábrica de Salgados Artesanais</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Identificação */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>41 anos</span>
              <span>•</span>
              <MapPin className="h-4 w-4" />
              <span>Belo Horizonte/MG</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Heart className="h-3 w-3 mr-1" />
                Mãe solo de 2 filhos
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                5 anos empreendendo
              </Badge>
            </div>
          </div>

          {/* Situação pessoal */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Situação atual:</p>
            <p className="text-sm leading-relaxed">
              Divorciada, sustenta a família com sua pequena fábrica de salgados. 
              Trabalha 12h/dia entre produção e administração do negócio.
            </p>
          </div>


          {/* Maiores dificuldades */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">Principais Dificuldades</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>"Não sabia se o negócio realmente dava lucro"</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>"Perdia 2 horas por dia organizando planilhas"</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>"Emitir notas fiscais era um pesadelo"</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>"Controle de estoque em cadernos"</span>
              </div>
            </div>
          </div>


          {/* Soluções do Pipeline Labs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-semibold text-sm">Com o Pipeline Labs</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Dashboard financeiro</strong> mostra lucros em tempo real</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Notas fiscais</strong> emitidas em 3 cliques</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Controle automático</strong> de ingredientes e estoque</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Ordem de produção</strong> otimizada por demanda</span>
              </div>
            </div>
          </div>

          {/* Resultado final */}
          <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              💡 <strong>Resultado:</strong> Carla conseguiu contratar 2 funcionários e dobrar 
              sua produção, mantendo total controle financeiro e operacional.
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}