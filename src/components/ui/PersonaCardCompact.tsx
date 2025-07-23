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
    <Card className={`overflow-hidden shadow-lg h-[600px] ${className}`}>
      <CardContent className="p-0">
        {/* Foto da persona */}
        <div className="relative">
          <img 
            src={persona.image} 
            alt={`${persona.name} - ${persona.business}`} 
            className="w-full h-40 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-bold text-xl">{persona.name}</h3>
            <p className="text-white/90 text-sm">{persona.business}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Identificação - Minimalista */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{persona.age} anos</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{persona.location}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                {persona.situation ? (persona.situation.length > 20 ? persona.situation.slice(0, 20) + '...' : persona.situation) : 'Empreendedor'}
              </Badge>
            </div>
          </div>

          {/* Maiores dificuldades - Destacado */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-bold text-base">Principais Dificuldades</span>
            </div>
            
            <div className="space-y-3">
              {(persona.problems || []).slice(0, 4).map((problem, index) => (
                <div key={index} className="flex items-start gap-3 text-base">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="font-medium">{problem}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soluções do Pipeline Labs - Destacado */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-bold text-base">Com Pipeline Labs</span>
            </div>
            
            <div className="space-y-3">
              {(persona.solutions || []).slice(0, 4).map((solution, index) => (
                <div key={index} className="flex items-start gap-3 text-base">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}