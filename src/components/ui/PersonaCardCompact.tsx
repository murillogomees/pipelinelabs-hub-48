import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, MapPin, User, Heart, Clock } from 'lucide-react';
import { PipelineLabsLogo } from '@/components/Layout/PipelineLabsLogo';

interface PersonaData {
  id: number;
  name: string;
  age: number;
  business: string;
  location: string;
  situation: string;
  problems: string[];
  solutions: string[];
  result: string;
  image: string;
}

interface PersonaCardCompactProps {
  persona: PersonaData;
  className?: string;
}

export function PersonaCardCompact({ persona, className = '' }: PersonaCardCompactProps) {
  return (
    <Card className={`overflow-hidden shadow-lg h-[300px] ${className}`}>
      {/* Header com logo Pipeline Labs */}
      <div className="bg-primary/5 p-3 border-b">
        <PipelineLabsLogo size="sm" />
      </div>

      <CardContent className="p-0">
        {/* Foto da persona */}
        <div className="relative">
          <img 
            src={persona.image} 
            alt={`${persona.name} - ${persona.business}`} 
            className="w-full h-24 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h3 className="text-white font-bold text-lg">{persona.name}</h3>
            <p className="text-white/90 text-xs">{persona.business}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Identificação */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{persona.age} anos</span>
              <span>•</span>
              <MapPin className="h-3 w-3" />
              <span>{persona.location}</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <Heart className="h-2 w-2 mr-1" />
                {persona.situation}
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
              {(persona.problems || []).slice(0, 2).map((problem, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="leading-tight">{problem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soluções do Pipeline Labs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span className="font-semibold text-xs">Com Pipeline Labs</span>
            </div>
            
            <div className="space-y-1">
              {(persona.solutions || []).slice(0, 2).map((solution, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}