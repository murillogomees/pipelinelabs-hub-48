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
    <Card className={`overflow-hidden shadow-lg h-[400px] ${className}`}>
      <CardContent className="p-0">
        {/* Foto da persona */}
        <div className="relative">
          <img 
            src={carlaPersona} 
            alt="Carla - Empreendedora de salgados artesanais" 
            className="w-full h-32 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h3 className="text-white font-bold text-lg">Carla Santos</h3>
            <p className="text-white/90 text-xs">Fábrica de Salgados Artesanais</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Identificação */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>41 anos</span>
              <span>•</span>
              <MapPin className="h-3 w-3" />
              <span>Belo Horizonte/MG</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <Heart className="h-2 w-2 mr-1" />
                Mãe solo de 2 filhos
              </Badge>
              <Badge variant="outline" className="text-xs px-2 py-1">
                <Clock className="h-2 w-2 mr-1" />
                5 anos empreendendo
              </Badge>
            </div>
          </div>


          {/* Maiores dificuldades */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-semibold text-xs">Dificuldades</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-xs">
                <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="leading-tight">"Não sabia se o negócio dava lucro"</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="leading-tight">"2h/dia organizando planilhas"</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="leading-tight">"Notas fiscais eram um pesadelo"</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="leading-tight">"Controle de estoque em cadernos"</span>
              </div>
            </div>
          </div>


          {/* Soluções do Pipeline Labs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span className="font-semibold text-xs">Com Pipeline Labs</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="leading-tight"><strong>Dashboard</strong> mostra lucros em tempo real</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="leading-tight"><strong>Notas fiscais</strong> em 3 cliques</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="leading-tight"><strong>Controle automático</strong> de estoque</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="leading-tight"><strong>Ordem de produção</strong> otimizada</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}