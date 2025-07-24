import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  carlaPersona,
  lucasPersonaCard, 
  anaPersona,
  eduardoPersona,
  patriciaPersona,
  joaoPersona 
} from '@/assets';

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

// Helper function to map persona names to images
const getPersonaImage = (name: string, fallbackImage: string) => {
  const imageMap: { [key: string]: string } = {
    'Carla Santos': carlaPersona,
    'Lucas Silva': lucasPersonaCard,
    'Ana Costa': anaPersona,
    'Eduardo Martins': eduardoPersona,
    'Patrícia Lima': patriciaPersona,
    'João Santos': joaoPersona
  };
  
  return imageMap[name] || fallbackImage;
};

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
  const personaImage = getPersonaImage(name, image);
  return (
    <Card className={cn(
      "group overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300",
      className
    )}>
      {/* Container da imagem com overlay e textos sobrepostos */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={personaImage}
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

      {/* Conteúdo do card com layout padronizado */}
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Descrição da persona */}
        <div className="text-center">
          <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
            {business}
          </p>
        </div>

        {/* Seções padronizadas com estrutura consistente */}
        <div className="space-y-4 sm:space-y-6">
          {/* Principais Dores */}
          {problems && problems.length > 0 && (
            <div className="w-full p-4 sm:p-5 lg:p-6 rounded-lg bg-background border border-border/50">
              <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-destructive mb-3 sm:mb-4 text-center">
                Principais Dores
              </h4>
              <ul className="text-xs sm:text-sm lg:text-base text-muted-foreground space-y-2 sm:space-y-2.5">
                {problems.map((problem: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-left">
                    <span className="text-destructive mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed">{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Soluções Pipeline Labs */}
          {solutions && solutions.length > 0 && (
            <div className="w-full p-4 sm:p-5 lg:p-6 rounded-lg bg-background border border-border/50">
              <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-success mb-3 sm:mb-4 text-center">
                Soluções Pipeline Labs
              </h4>
              <ul className="text-xs sm:text-sm lg:text-base text-muted-foreground space-y-2 sm:space-y-2.5">
                {solutions.map((solution: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-left">
                    <span className="text-success mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: solution }} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resultado Alcançado */}
          {result && (
            <div className="w-full p-4 sm:p-5 lg:p-6 rounded-lg bg-muted/50 border-l-4 border-primary">
              <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-primary mb-3 sm:mb-4 text-center">
                🚀 Resultado Alcançado
              </h4>
              <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-foreground text-center">{result}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}