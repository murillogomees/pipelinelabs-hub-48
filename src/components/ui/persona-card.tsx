import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PersonaCardProps {
  name: string;
  age: number;
  location: string;
  business: string;
  image: string;
  problems?: string[];
  solutions?: string[];
  result?: string;
  className?: string;
}

export function PersonaCard({
  name,
  age,
  location,
  business,
  image,
  problems,
  solutions,
  result,
  className
}: PersonaCardProps) {
  return (
    <Card className={cn(
      "group overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300",
      className
    )}>
      {/* Container da imagem com overlay e textos sobrepostos */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={`${name}, ${age} anos`}
          className="w-full h-full object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay escuro suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Localização - canto superior esquerdo */}
        <div className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs sm:text-sm font-medium">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="drop-shadow-md">{location}</span>
        </div>
        
        {/* Nome + Idade - canto inferior esquerdo */}
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold drop-shadow-md">
            {name}, <span className="font-light">{age}</span>
          </h3>
        </div>
      </div>

      {/* Conteúdo do card com layout simétrico e fixo */}
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        {/* Descrição da persona - logo abaixo da imagem */}
        <div className="text-center mb-4">
          <p className="text-base sm:text-lg lg:text-xl font-semibold text-foreground leading-tight">
            {business}
          </p>
        </div>

        {/* Container flexível para manter layout simétrico */}
        <div className="flex flex-col flex-1 space-y-4">
          {/* Principais Dores - sempre no topo */}
          <div className="flex-shrink-0">
            <h4 className="font-semibold text-sm text-destructive mb-2 flex items-center gap-1">
              😰 Principais Dores
            </h4>
            <div className="min-h-[60px] sm:min-h-[80px]">
              {problems && problems.length > 0 ? (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {problems.map((problem: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-destructive mt-0.5">•</span>
                      {problem}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">Nenhuma dor identificada</p>
              )}
            </div>
          </div>

          {/* Soluções - sempre no meio */}
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="font-semibold text-sm text-success mb-2 flex items-center gap-1">
              ✅ Soluções Pipeline Labs
            </h4>
            <div className="min-h-[60px] sm:min-h-[80px]">
              {solutions && solutions.length > 0 ? (
                <ul className="text-xs space-y-1">
                  {solutions.map((solution: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-success mt-0.5">•</span>
                      <span dangerouslySetInnerHTML={{ __html: solution }} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">Soluções em desenvolvimento</p>
              )}
            </div>
          </div>

          {/* Resultado Alcançado - sempre no bottom */}
          <div className="flex-shrink-0 mt-auto">
            <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
              <h4 className="font-semibold text-sm text-primary mb-1 flex items-center gap-1">
                🚀 Resultado Alcançado
              </h4>
              <div className="min-h-[40px] flex items-center">
                {result ? (
                  <p className="text-xs leading-relaxed">{result}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Resultado em análise</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}